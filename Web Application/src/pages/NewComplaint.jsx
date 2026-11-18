import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  Shield, Sparkles, Send, ArrowLeft, AlertTriangle, CheckCircle2,
  Info, MapPin, Tag, FileText, Zap, Layers, Crosshair,
  Camera, UploadCloud, Image as ImageIcon, X, Trash2, Loader2, Navigation
} from 'lucide-react';

const SUB_CATEGORIES = {
  Academic: [
    'Course Registration',
    'Exam Evaluation',
    'Faculty Feedback',
    'Hall Ticket',
    'Lab Software'
  ],
  Maintenance: [
    'Electricity/Power Failure',
    'Plumbing/Water Leakage',
    'AC/Fan Issue',
    'Furniture Repair',
    'Cleanliness'
  ],
  Facilities: [
    'Hostel Amenities',
    'Library Access',
    'Sports Equipment',
    'Cafeteria/Mess',
    'Wi-Fi/Internet'
  ]
};

const PLACEHOLDERS = {
  Academic: 'e.g., Exam grading discrepancy in CS-301 or Hall Ticket missing roll number',
  Maintenance: 'e.g., Fume sparking & power trip in Chem Lab 302 or water leaking near room 405',
  Facilities: 'e.g., Library Wi-Fi disconnecting frequently or projector display blinking in Block A'
};

const CAMPUS_AREAS = [
  'Main Academic Block',
  'Engineering Block',
  'Boys Hostel',
  'Girls Hostel',
  'Central Library',
  'Food Court / Mess'
];

const FLOORS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor'
];

// Default Campus Center Coordinates
const DEFAULT_CAMPUS_COORDS = { lat: 12.9716, lng: 77.5946 };

const NewComplaint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form Fields State
  const [category, setCategory] = useState('Maintenance');
  const [subCategory, setSubCategory] = useState(SUB_CATEGORIES.Maintenance[0]);

  // Location Fields
  const [campusArea, setCampusArea] = useState(CAMPUS_AREAS[0]);
  const [floor, setFloor] = useState(FLOORS[0]);
  const [roomNumber, setRoomNumber] = useState('');

  // GPS & Map State
  const [useGps, setUseGps] = useState(false);
  const [gpsLocation, setGpsLocation] = useState('');
  const [gpsStatus, setGpsStatus] = useState('');
  const [gpsCoords, setGpsCoords] = useState(DEFAULT_CAMPUS_COORDS);
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const [mapLoading, setMapLoading] = useState(false);

  // Map Container References
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Complaint Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Image Attachment State
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Real-time AI preview & submission states
  const [priorityAnalysis, setPriorityAnalysis] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Update sub-category automatically when category changes
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (SUB_CATEGORIES[newCat] && SUB_CATEGORIES[newCat].length > 0) {
      setSubCategory(SUB_CATEGORIES[newCat][0]);
    }
  };

  // Robust Geolocation Auto-Detection with Complete Error Handling
  const handleGpsToggle = (e) => {
    const checked = e.target.checked;
    setUseGps(checked);
    setGpsErrorMsg('');

    if (checked) {
      setGpsStatus('Fetching live location...');
      setMapLoading(true);

      if (!('geolocation' in navigator)) {
        const msg = 'Geolocation is not supported by your browser. Defaulted to Campus Center.';
        console.warn('[GPS Warning]', msg);
        setGpsErrorMsg(msg);
        setGpsStatus('GPS Unavailable (Using Campus Default)');
        setGpsCoords(DEFAULT_CAMPUS_COORDS);
        setGpsLocation(`Lat: ${DEFAULT_CAMPUS_COORDS.lat}, Lng: ${DEFAULT_CAMPUS_COORDS.lng} (Campus Geofence)`);
        setMapLoading(false);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          const locStr = `Lat: ${lat}, Lng: ${lng} (Campus Zone A)`;

          setGpsCoords({ lat, lng });
          setGpsLocation(locStr);
          setGpsStatus('GPS Lock Active (High Accuracy)');
          setGpsErrorMsg('');
          setMapLoading(false);
          console.log('[GPS Lock Success]', locStr);
        },
        (err) => {
          let reason = '';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              reason = 'Location access permission was denied by browser/user.';
              break;
            case err.POSITION_UNAVAILABLE:
              reason = 'Location information is unavailable (low GPS signal).';
              break;
            case err.TIMEOUT:
              reason = 'Location request timed out after 8 seconds.';
              break;
            default:
              reason = err.message || 'An unknown error occurred while retrieving location.';
          }

          console.warn('[GPS Geolocation Error]', err.code, reason);
          setGpsErrorMsg(`${reason} Defaulting to Campus Center.`);
          setGpsStatus('GPS Geofence Fallback');
          setGpsCoords(DEFAULT_CAMPUS_COORDS);
          setGpsLocation(`Lat: ${DEFAULT_CAMPUS_COORDS.lat}, Lng: ${DEFAULT_CAMPUS_COORDS.lng} (Main Campus Geofence)`);
          setMapLoading(false);
        },
        options
      );
    } else {
      setGpsLocation('');
      setGpsStatus('');
      setGpsErrorMsg('');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    }
  };

  // Render Leaflet Map & Handle invalidateSize()
  useEffect(() => {
    if (!useGps || !mapContainerRef.current) return;

    let isMounted = true;

    const initLeafletMap = async () => {
      try {
        // Load Leaflet CSS if missing
        if (!document.getElementById('leaflet-css-cdn')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css-cdn';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Load Leaflet JS if missing
        if (!window.L) {
          if (!document.getElementById('leaflet-js-cdn')) {
            const script = document.createElement('script');
            script.id = 'leaflet-js-cdn';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            document.head.appendChild(script);
            await new Promise((resolve) => { script.onload = resolve; });
          } else {
            await new Promise((resolve) => {
              const checkL = setInterval(() => {
                if (window.L) {
                  clearInterval(checkL);
                  resolve();
                }
              }, 100);
            });
          }
        }

        if (!isMounted || !mapContainerRef.current || !window.L) return;

        // Clean up previous map instance if exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize Map
        const map = window.L.map(mapContainerRef.current, {
          center: [gpsCoords.lat, gpsCoords.lng],
          zoom: 16,
          zoomControl: true
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Custom Marker Pin
        const marker = window.L.marker([gpsCoords.lat, gpsCoords.lng]).addTo(map);
        marker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
            <b style="color: #2563eb;">📍 Campus Incident Location</b><br/>
            <span style="font-size: 11px;">Lat: ${gpsCoords.lat}, Lng: ${gpsCoords.lng}</span>
          </div>
        `).openPopup();

        mapInstanceRef.current = map;

        // Explicitly trigger invalidateSize() after DOM layout stabilizes
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 250);

      } catch (mapErr) {
        console.error('[Leaflet Map Render Error]', mapErr);
      }
    };

    initLeafletMap();

    return () => {
      isMounted = false;
    };
  }, [useGps, gpsCoords]);

  // Format file size utility
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // File Picker Handler with 5MB validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    // Check size limit (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('Selected image exceeds the maximum 5MB size limit. Please choose a smaller photo.');
      e.target.value = '';
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PNG, JPG, JPEG, or WEBP image.');
      e.target.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create live Base64 preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setUploadError('');
  };

  // Build full structured location string
  const getFullLocationString = () => {
    const parts = [campusArea, floor];
    if (roomNumber.trim()) parts.push(roomNumber.trim());
    if (useGps && gpsLocation) parts.push(`[${gpsLocation}]`);
    return parts.join(' • ');
  };

  // Auto-calculate AI priority score preview on field changes
  useEffect(() => {
    const fullLocation = getFullLocationString();

    const timer = setTimeout(async () => {
      if (title.trim() && description.trim()) {
        setPreviewLoading(true);
        try {
          const { data } = await API.post('/complaints/preview-priority', {
            title,
            category,
            subCategory,
            location: fullLocation,
            description
          });
          setPriorityAnalysis(data);
        } catch (err) {
          console.warn('Backend preview API unreachable, executing client AI priority scoring:', err.message);

          // Client-side fallback priority calculation
          const text = `${title} ${description} ${category} ${subCategory}`.toLowerCase();
          const urgentKeywords = ['fire', 'spark', 'electric', 'smoke', 'hazard', 'leak', 'stuck', 'panic', 'emergency', 'shock'];
          const matched = urgentKeywords.filter(k => text.includes(k));

          let score = 35;
          if (matched.length > 0) score += matched.length * 25;
          if (category === 'Maintenance' || category === 'Emergency') score += 15;
          score = Math.min(Math.max(score, 10), 98);

          let priority = 'LOW';
          if (score >= 70) priority = 'HIGH';
          else if (score >= 45) priority = 'MEDIUM';

          setPriorityAnalysis({
            priority,
            priorityScore: score,
            priorityReason: matched.length > 0
              ? `High urgency keyword match: ${matched.join(', ')}`
              : `Standard urgency level evaluated for ${category} (${subCategory})`,
            detectedKeywords: matched
          });
        } finally {
          setPreviewLoading(false);
        }
      } else {
        setPriorityAnalysis(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [title, category, subCategory, campusArea, floor, roomNumber, description, useGps, gpsLocation]);

  // Robust Upload Photo to Firebase Storage with full error logging & Base64 fallback timeout
  const uploadPhotoToStorage = async (file) => {
    if (!file) return null;

    return new Promise((resolve) => {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError('');

      // Guard Timeout: If Firebase Storage freezes/hangs (e.g. CORS/unauthorized rules or dummy API key), fallback after 6 seconds
      const timeoutTimer = setTimeout(() => {
        console.warn('[Firebase Storage Timeout] Storage upload timed out. Falling back to local preview data payload.');
        setUploadError('Firebase Storage upload timed out (CORS/Rules). Using local photo payload.');
        setIsUploading(false);
        setUploadProgress(100);
        resolve(imagePreview || null);
      }, 6000);

      try {
        if (!storage) {
          throw new Error('Firebase Storage instance is uninitialized or null.');
        }

        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const storageRef = ref(storage, `complaints/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            console.log(`[Firebase Storage Progress] ${progress}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
            setUploadProgress(progress);
          },
          (error) => {
            clearTimeout(timeoutTimer);
            console.error('[Firebase Storage Upload Error]', error.code, error.message, error);
            setUploadError(`Storage Error (${error.code || 'Upload Failed'}). Using photo preview.`);
            setIsUploading(false);
            setUploadProgress(100);
            resolve(imagePreview || null);
          },
          async () => {
            clearTimeout(timeoutTimer);
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('[Firebase Storage Upload Success] Public URL:', downloadURL);
              setUploadProgress(100);
              setIsUploading(false);
              resolve(downloadURL);
            } catch (urlErr) {
              console.error('[Firebase getDownloadURL Error]', urlErr.code, urlErr.message, urlErr);
              setIsUploading(false);
              resolve(imagePreview || null);
            }
          }
        );
      } catch (err) {
        clearTimeout(timeoutTimer);
        console.error('[Firebase Storage Execution Exception]', err.message, err);
        setUploadError(`Storage Init Error: ${err.message}. Using preview payload.`);
        setIsUploading(false);
        resolve(imagePreview || null);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || isUploading) return;

    if (!title.trim() || !description.trim() || !roomNumber.trim()) {
      setError('Please fill in all required fields (Title, Room/Lab/Section, and Description).');
      return;
    }

    setError('');
    setSubmitting(true);
    const specificLocation = getFullLocationString();

    try {
      // 1. Upload attached photo to Firebase Storage (complaints/ path) & retrieve download URL
      let photoUrl = null;
      if (selectedFile) {
        photoUrl = await uploadPhotoToStorage(selectedFile);
      }

      const aiPriorityScore = priorityAnalysis?.priorityScore || 50;
      const timestamp = new Date().toISOString();

      const complaintData = {
        Category: category,
        category: category,
        subCategory,
        Title: title.trim(),
        title: title.trim(),
        SpecificLocation: specificLocation,
        location: specificLocation,
        specificLocation: specificLocation,
        Description: description.trim(),
        description: description.trim(),
        AIPriorityScore: aiPriorityScore,
        aiPriorityScore: aiPriorityScore,
        priorityScore: aiPriorityScore,
        priority: priorityAnalysis?.priority || 'MEDIUM',
        priorityReason: priorityAnalysis?.priorityReason || 'Complaint registered',
        detectedKeywords: priorityAnalysis?.detectedKeywords || [],
        PhotoUrl: photoUrl || null,
        photoUrl: photoUrl || null,
        imageUrl: photoUrl || null,
        attachments: photoUrl ? [photoUrl] : [],
        Timestamp: timestamp,
        timestamp: timestamp,
        createdAt: timestamp,
        studentId: user?._id || user?.email || 'student_demo_001',
        studentName: user?.name || 'Campus Student',
        studentEmail: user?.email || 'student@college.com',
        status: 'Submitted'
      };

      // 2. Save to Firestore (optional/secondary — errors don't block submission)
      if (db) {
        try {
          const docRef = await addDoc(collection(db, 'complaints'), {
            ...complaintData,
            createdAtFirestore: serverTimestamp()
          });
          console.log('[Firestore complaints Collection Document Created]', docRef.id);
        } catch (fsErr) {
          console.warn('[Firestore complaints Collection Save Warning]', fsErr.code, fsErr.message);
        }
      }

      // 3. Save to Backend API (PRIMARY data store — this must succeed)
      let backendId = null;
      try {
        const { data } = await API.post('/complaints', complaintData);
        backendId = data._id;
      } catch (apiErr) {
        console.error('[Backend API Save Error]', apiErr.message);
        if (apiErr.code === 'ERR_NETWORK' || apiErr.message === 'Network Error') {
          setError('Cannot reach the backend server. Please make sure the backend is running on http://localhost:5000');
          setSubmitting(false);
          return;
        }
        throw apiErr;
      }

      setSuccessMsg('Complaint ticket successfully registered!');

      setTimeout(() => {
        if (backendId) {
          navigate(`/complaint/${backendId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1200);

    } catch (err) {
      console.error('Submission Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit complaint ticket.');
    } finally {
      setSubmitting(false);
      setIsUploading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'HIGH') return 'from-rose-500/20 to-rose-600/10 border-rose-500/40 text-rose-300';
    if (priority === 'MEDIUM') return 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300';
    return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-300';
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Navigation Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" /> AI Ticket Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            File a New Grievance / Complaint
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Fill in the details, attach photo proof, and submit. ResolveQ will analyze urgency in real-time.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form Column */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">

              {/* Category Selector Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Category *</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Academic', 'Maintenance', 'Facilities'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${category === cat
                        ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/50 shadow-lg shadow-blue-600/40'
                        : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                        }`}
                    >
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Sub-Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sub-Category *</span>
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl focus:border-blue-500"
                >
                  {SUB_CATEGORIES[category]?.map((sub) => (
                    <option key={sub} value={sub} className="bg-slate-900 text-slate-200">
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Structured Location Selectors */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Specific Location Details</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campus / Area Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Campus / Area *
                    </label>
                    <select
                      value={campusArea}
                      onChange={(e) => setCampusArea(e.target.value)}
                      className="glass-input w-full px-3 py-2.5 text-xs bg-slate-900 text-slate-200 border border-slate-800 rounded-xl"
                    >
                      {CAMPUS_AREAS.map((area) => (
                        <option key={area} value={area} className="bg-slate-900 text-slate-200">
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Floor / Wing Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Floor / Wing *
                    </label>
                    <select
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="glass-input w-full px-3 py-2.5 text-xs bg-slate-900 text-slate-200 border border-slate-800 rounded-xl"
                    >
                      {FLOORS.map((f) => (
                        <option key={f} value={f} className="bg-slate-900 text-slate-200">
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specific Room / Lab / Section */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Specific Room / Lab / Section *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder='e.g., "CS Lab 3", "Room 304", or "Hostel Block B - Room 112"'
                    className="glass-input w-full px-3.5 py-2.5 text-xs"
                  />
                </div>

                {/* GPS / Current Campus Location Checkbox */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={useGps}
                        onChange={handleGpsToggle}
                        className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-950"
                      />
                      <span className="flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                        GPS / Current Campus Location (Auto-detect)
                      </span>
                    </label>

                    {gpsStatus && (
                      <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {gpsStatus}
                      </span>
                    )}
                  </div>

                  {gpsErrorMsg && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{gpsErrorMsg}</span>
                    </div>
                  )}

                  {/* Leaflet Interactive Map Container */}
                  {useGps && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-blue-400" /> Live Campus Pinpoint Map
                        </span>
                        <span className="font-mono text-blue-300 text-[10px]">
                          {gpsCoords.lat}, {gpsCoords.lng}
                        </span>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-lg bg-slate-900">
                        {mapLoading && (
                          <div className="absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center text-xs text-slate-300">
                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin mb-1" />
                            <span>Resolving GPS Geofence...</span>
                          </div>
                        )}

                        <div
                          ref={mapContainerRef}
                          className="w-full rounded-2xl z-10"
                          style={{ minHeight: '250px', width: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Subject / Title *</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={PLACEHOLDERS[category] || 'Brief summary of the issue...'}
                  className="glass-input w-full px-4 py-3 text-sm"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Detailed Description *</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail. Include safety hazards, urgency, or specific impact..."
                  className="glass-input w-full px-4 py-3 text-sm resize-none"
                />
              </div>

              {/* Proof / Photo Attachment Section */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Proof / Photo Attachment (Optional, Max 5MB)</span>
                </label>

                {!imagePreview ? (
                  <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-center transition-all bg-slate-900/30">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">
                        Click to upload photo evidence
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Supports PNG, JPG, JPEG (Max 5MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Evidence Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">
                          {selectedFile?.name || 'Photo Evidence'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {selectedFile ? formatFileSize(selectedFile.size) : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all shrink-0"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload Progress & Error Notice */}
                {isUploading && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                      <span>Uploading photo evidence to Firebase Storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="text-[11px] text-amber-400 font-medium pt-1">
                    ⚠️ {uploadError}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || isUploading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting || isUploading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    <span>{isUploading ? `Uploading Photo (${uploadProgress}%)...` : 'Registering Ticket...'}</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Complaint Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Live Preview Badge Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              <div className="glass-card p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h3 className="text-sm font-extrabold text-white">Real-Time AI Urgency Preview</h3>
                </div>

                {!title.trim() && !description.trim() ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                    <Zap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs leading-relaxed">
                      Start typing title, location & description to see instant AI priority score calculation.
                    </p>
                  </div>
                ) : previewLoading ? (
                  <div className="p-8 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-semibold">Calculating urgency vector...</p>
                  </div>
                ) : priorityAnalysis ? (
                  <div className={`p-5 rounded-2xl bg-gradient-to-b border ${getPriorityColor(priorityAnalysis.priority)} space-y-4`}>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-widest">
                        Tier: {priorityAnalysis.priority}
                      </span>
                      <span className="text-2xl font-black font-mono">
                        {priorityAnalysis.priorityScore}<span className="text-xs font-normal text-slate-400">/100</span>
                      </span>
                    </div>

                    {/* Progress Score Bar */}
                    <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${priorityAnalysis.priority === 'HIGH'
                          ? 'bg-rose-500'
                          : priorityAnalysis.priority === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          }`}
                        style={{ width: `${priorityAnalysis.priorityScore}%` }}
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider block mb-1">
                        Reason Breakdown:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {priorityAnalysis.priorityReason}
                      </p>
                    </div>

                    {priorityAnalysis.detectedKeywords?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Detected Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {priorityAnalysis.detectedKeywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 text-slate-300 border border-slate-700">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Informational tip */}
              <div className="glass-card p-4 rounded-2xl text-xs text-slate-400 flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  High urgency tickets (Score 70+) trigger immediate priority alerts for administrators on duty.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default NewComplaint;
