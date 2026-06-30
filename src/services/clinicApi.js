const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const geocodeLocation = async (locationText) => {
  if (!API_KEY || API_KEY === 'your_google_maps_api_key_here') {
    throw new Error('API_KEY_MISSING');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationText)}&key=${API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'OK' && data.results.length > 0) {
    return data.results[0].geometry.location; // { lat, lng }
  }
  
  throw new Error('LOCATION_NOT_FOUND');
};

export const fetchNearbyClinics = async ({ lat, lng }) => {
  if (!API_KEY || API_KEY === 'your_google_maps_api_key_here') {
    throw new Error('API_KEY_MISSING');
  }

  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  
  // X-Goog-FieldMask dictates exactly what data Google returns
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.regularOpeningHours,places.nationalPhoneNumber,places.primaryType'
  };

  const body = JSON.stringify({
    includedTypes: ["hospital", "medical_clinic"],
    maxResultCount: 15,
    locationRestriction: {
      circle: {
        center: {
          latitude: lat,
          longitude: lng
        },
        radius: 10000.0 // 10km radius
      }
    }
  });

  const response = await fetch(url, { method: 'POST', headers, body });
  
  if (!response.ok) {
    console.error("Google Places API error:", await response.text());
    throw new Error('API_ERROR');
  }

  const data = await response.json();
  
  if (!data.places) return [];

  // Map Google Places data into our standard facility format
  return data.places.map(place => {
    // Generate a map link for navigation
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}&query_place_id=${place.id}`;

    return {
      id: place.id,
      name: place.displayName?.text || 'Unknown Facility',
      county: 'API Result', // Differentiator
      type: (place.primaryType || 'Healthcare Facility').replace('_', ' '),
      location: place.formattedAddress || 'Address not available',
      phone: place.nationalPhoneNumber || '',
      services: 'General healthcare', // API doesn't specify breast cancer services specifically
      openingHours: place.regularOpeningHours?.openNow ? 'Open Now' : 'Closed or hours unknown',
      rating: place.rating || null,
      mapLink: mapLink,
      isApiResult: true
    };
  });
};

export const getCurrentUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("UNSUPPORTED"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("PERMISSION_DENIED"));
        } else {
          reject(new Error("LOCATION_ERROR"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
