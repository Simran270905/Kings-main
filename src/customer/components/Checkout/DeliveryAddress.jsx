import React, { useState, useEffect } from "react";
import { Grid, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@config/api.js';

const API_URL = API_BASE_URL;

// ✅ LOCALSTORAGE ADDRESS MANAGEMENT
const saveAddressToLocalStorage = (address) => {
    localStorage.setItem('savedAddress', JSON.stringify(address));
};

const getSavedAddressFromLocalStorage = () => {
    try {
        const saved = localStorage.getItem('savedAddress');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error parsing saved address:', error);
        return null;
    }
};

const DeliveryAddressForm = ({ address = {}, onAddressChange }) => {
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ LOAD SAVED ADDRESS FROM LOCALSTORAGE ON MOUNT
    useEffect(() => {
        const savedAddress = getSavedAddressFromLocalStorage();
        if (savedAddress && !address.firstName) {
            // Only use saved address if no address provided via props
            setFormData(savedAddress);
            if (onAddressChange && typeof onAddressChange === 'function') {
                onAddressChange(savedAddress);
            }
        }
    }, [address.firstName]); // Only depend on address.firstName, not onAddressChange

    // Load saved addresses from backend
    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${API_URL}/customers/addresses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const addresses = await response.json();
                    setSavedAddresses(addresses.data || []);
                }
            } catch (error) {
                console.error('Failed to load addresses:', error);
            }
        };

        loadAddresses();
    }, []);
    // FIXED: Initialize form state from props and manage local state
    const [formData, setFormData] = useState(address || {
        firstName: '',
        lastName: '',
        email: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        mobile: '',
    });

    // Auto-fill with default address if available
    useEffect(() => {
        if (savedAddresses.length > 0) {
            const defaultAddress = savedAddresses.find(addr => addr.isDefault);
            if (defaultAddress && !address.firstName) {
                const addrData = {
                    firstName: defaultAddress.firstName,
                    lastName: defaultAddress.lastName,
                    email: defaultAddress.email,
                    streetAddress: defaultAddress.streetAddress,
                    city: defaultAddress.city,
                    state: defaultAddress.state,
                    zipCode: defaultAddress.zipCode,
                    mobile: defaultAddress.mobile,
                };
                setFormData(addrData);
                if (onAddressChange && typeof onAddressChange === 'function') {
                    onAddressChange(addrData);
                }
            }
        }
    }, [savedAddresses.length, address.firstName]); // Only depend on length and firstName, not onAddressChange

    const [errors, setErrors] = useState({});

    // Update local state when input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };
        setFormData(newData);
        
        // ✅ SAVE TO LOCALSTORAGE ON EVERY CHANGE FOR PERSISTENCE
        saveAddressToLocalStorage(newData);
        
        // FIXED: Update parent component state in real-time
        if (onAddressChange && typeof onAddressChange === 'function') {
            onAddressChange(newData);
        }
    };

    // FIXED: Add form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.streetAddress?.trim()) newErrors.streetAddress = 'Address is required';
        if (!formData.city?.trim()) newErrors.city = 'City is required';
        if (!formData.state?.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip code is required';
        if (!formData.mobile?.trim()) newErrors.mobile = 'Phone number is required';
        // FIXED: Basic phone validation
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
            newErrors.mobile = 'Please enter a valid 10-digit phone number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // FIXED: Validate before submission
        if (!validateForm()) {
            toast.error('Please fill all required fields correctly');
            return;
        }

        setIsLoading(true);
        try {
            // ✅ ALWAYS SAVE TO LOCALSTORAGE FIRST
            saveAddressToLocalStorage(formData);
            
            // ✅ UPDATE PARENT COMPONENT IMMEDIATELY
            if (onAddressChange && typeof onAddressChange === 'function') {
                onAddressChange(formData);
            }

            // ✅ TRY TO SAVE TO BACKEND (OPTIONAL - DON'T BLOCK FLOW)
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // First check if backend is reachable
                    console.log('🔍 Checking backend connectivity...');
                    const healthCheck = await fetch(`${API_URL}/health`).catch(() => null);
                    
                    if (!healthCheck || !healthCheck.ok) {
                        console.warn('⚠️ Backend not reachable, saving locally only');
                        toast.success('Address saved locally (backend unavailable)');
                        return;
                    }
                    
                    console.log('✅ Backend reachable, attempting to save address:', formData);
                    const response = await fetch(`${API_URL}/customers/addresses`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(formData)
                    });

                    console.log('🔍 Backend response status:', response.status);
                    console.log('🔍 Backend response ok:', response.ok);

                    if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Backend save successful:', result);
                        toast.success('Address saved successfully');
                        
                        // Reload addresses from backend
                        try {
                            const addrResponse = await fetch(`${API_URL}/customers/addresses`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            if (addrResponse.ok) {
                                const addresses = await addrResponse.json();
                                setSavedAddresses(addresses.data || []);
                            }
                        } catch (addrError) {
                            console.error('Error loading addresses:', addrError);
                        }
                    } else {
                        // Backend save failed, but local save worked
                        const errorData = await response.json().catch(() => ({}));
                        console.warn('⚠️ Backend save failed:', response.status, errorData);
                        
                        // Provide specific error messages based on status
                        if (response.status === 401) {
                            toast.error('Session expired. Please login again.');
                        } else if (response.status === 404) {
                            toast.error('Service temporarily unavailable. Address saved locally.');
                        } else if (response.status >= 500) {
                            toast.error('Server error. Address saved locally.');
                        } else {
                            toast.error('Address saved locally (backend error)');
                        }
                    }
                } catch (backendError) {
                    // Backend unavailable, but local save worked
                    console.warn('⚠️ Backend unavailable, address saved locally:', backendError);
                    toast.success('Address saved locally');
                }
            } else {
                // No token, but address saved locally
                console.log('ℹ️ No token found, address saved locally only');
                toast.success('Address saved locally');
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            // Even if everything fails, we still have the local storage save
            toast.error('Address saved locally (backend unavailable)');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                    <Box className="border rounded-s-md shadow-md p-5">
                        {/* ✅ LOCALSTORAGE SAVED ADDRESS */}
                        {getSavedAddressFromLocalStorage() && savedAddresses.length === 0 && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Saved Address Available</p>
                                        <p className="text-xs text-blue-700">Use your previously entered address</p>
                                    </div>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            const savedAddr = getSavedAddressFromLocalStorage();
                                            setFormData(savedAddr);
                                            if (onAddressChange && typeof onAddressChange === 'function') {
                                                onAddressChange(savedAddr);
                                            }
                                            toast.success('Address loaded from saved data');
                                        }}
                                    >
                                        Use Saved Address
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {savedAddresses.length > 0 && (
                            <div className="mb-6">
                                <FormControl fullWidth>
                                    <InputLabel>Select Saved Address</InputLabel>
                                    <Select
                                        value={selectedAddressIndex}
                                        onChange={(e) => {
                                            const index = e.target.value;
                                            setSelectedAddressIndex(index);
                                            if (index >= 0) {
                                                const addr = savedAddresses[index];
                                                const addrData = {
                                                    firstName: addr.firstName,
                                                    lastName: addr.lastName,
                                                    email: addr.email,
                                                    streetAddress: addr.streetAddress,
                                                    city: addr.city,
                                                    state: addr.state,
                                                    zipCode: addr.zipCode,
                                                    mobile: addr.mobile,
                                                };
                                                setFormData(addrData);
                                                // ✅ SAVE TO LOCALSTORAGE WHEN SELECTING SAVED ADDRESS
                                                saveAddressToLocalStorage(addrData);
                                                if (onAddressChange && typeof onAddressChange === 'function') {
                                                    onAddressChange(addrData);
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value={-1}>Use New Address</MenuItem>
                                        {savedAddresses.map((addr, index) => (
                                            <MenuItem key={index} value={index}>
                                                {addr.firstName} {addr.lastName}, {addr.city}, {addr.state}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        id="firstName"
                                        name="firstName"
                                        label="First Name"
                                        fullWidth
                                        autoComplete="given-name"
                                        value={formData.firstName || ''}
                                        onChange={handleChange}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        id="lastName"
                                        name="lastName"
                                        label="Last Name"
                                        fullWidth
                                        autoComplete="family-name"
                                        value={formData.lastName || ''}
                                        onChange={handleChange}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        id="email"
                                        name="email"
                                        label="Email"
                                        type="email"
                                        fullWidth
                                        autoComplete="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        id="streetAddress"
                                        name="streetAddress"
                                        label="Address"
                                        fullWidth
                                        autoComplete="shipping address-line1"
                                        multiline
                                        rows={4}
                                        value={formData.streetAddress || ''}
                                        onChange={handleChange}
                                        error={!!errors.streetAddress}
                                        helperText={errors.streetAddress}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        id="city"
                                        name="city"
                                        label="City"
                                        fullWidth
                                        autoComplete="shipping address-level2"
                                        value={formData.city || ''}
                                        onChange={handleChange}
                                        error={!!errors.city}
                                        helperText={errors.city}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        id="state"
                                        name="state"
                                        label="State/Province/Region"
                                        fullWidth
                                        value={formData.state || ''}
                                        onChange={handleChange}
                                        error={!!errors.state}
                                        helperText={errors.state}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        id="zipCode"
                                        name="zipCode"
                                        label="Zip/Postal Code"
                                        fullWidth
                                        autoComplete="shipping postal-code"
                                        value={formData.zipCode || ''}
                                        onChange={handleChange}
                                        error={!!errors.zipCode}
                                        helperText={errors.zipCode}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        id="mobile"
                                        name="mobile"
                                        label="Phone Number"
                                        fullWidth
                                        autoComplete="tel"
                                        value={formData.mobile || ''}
                                        onChange={handleChange}
                                        error={!!errors.mobile}
                                        helperText={errors.mobile}
                                        required
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Button
                                        sx={{ 
                                            py: 1.5, 
                                            mt: 2, 
                                            bgcolor: "#b30000",   // strong red
                                            "&:hover": {
                                            bgcolor: "#990000"  // darker red on hover
                                            }
                                        }}
                                        size="large"
                                        variant="contained"
                                        type="submit"
                                        >
                                        Deliver Here
                                        </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Box>
                </Grid>
            </Grid>
        </div>
    );
};

export default DeliveryAddressForm;