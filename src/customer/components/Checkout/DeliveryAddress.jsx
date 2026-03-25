import React, { useState, useEffect } from "react";
import { Grid, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@config/api.js';

const API_URL = API_BASE_URL;

const DeliveryAddressForm = ({ address = {}, onAddressChange }) => {
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    // Load saved addresses
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
                if (onAddressChange) onAddressChange(addrData);
            }
        }
    }, [savedAddresses, address, onAddressChange]);

    const [errors, setErrors] = useState({});

    // Update local state when input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };
        setFormData(newData);
        // FIXED: Update parent component state in real-time
        if (onAddressChange) {
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
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to save address');
                return;
            }

            const response = await fetch(`${API_URL}/customers/addresses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('Address saved successfully');
                // Reload addresses
                const addrResponse = await fetch(`${API_URL}/customers/addresses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (addrResponse.ok) {
                    const addresses = await addrResponse.json();
                    setSavedAddresses(addresses.data || []);
                }
            } else {
                toast.error('Failed to save address');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                    <Box className="border rounded-s-md shadow-md p-5">
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
                                                if (onAddressChange) onAddressChange(addrData);
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