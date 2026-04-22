import React, { useState, useEffect } from "react";
import { Grid, TextField, Button, Box } from "@mui/material";
import toast from 'react-hot-toast';

const DeliveryAddressForm = ({ address = {}, onAddressChange }) => {
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

    const [errors, setErrors] = useState({});

    // OPTIMIZED FOR GUEST CHECKOUT - NO UNNECESSARY API CALLS
    useEffect(() => {
        // For guest checkout, don't load saved addresses - user enters fresh address
        if (address.firstName) {
            setFormData(address);
            if (onAddressChange && typeof onAddressChange === 'function') {
                onAddressChange(address);
            }
        }
    }, [address.firstName]); // Only depend on address.firstName, not onAddressChange

    // Update local state when input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };
        setFormData(newData);
        
        // UPDATE PARENT COMPONENT IMMEDIATELY
        if (onAddressChange && typeof onAddressChange === 'function') {
            onAddressChange(newData);
        }
    };

    // Add form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        
        // Name validation - only allow characters/strings (letters, spaces, hyphens, apostrophes)
        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (formData.firstName && !nameRegex.test(formData.firstName.trim())) {
            newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }
        if (formData.lastName && !nameRegex.test(formData.lastName.trim())) {
            newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }
        
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        if (formData.email && !/\S+@\S+\./.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.streetAddress?.trim()) newErrors.streetAddress = 'Address is required';
        if (!formData.city?.trim()) newErrors.city = 'City is required';
        if (!formData.state?.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip code is required';
        if (!formData.mobile?.trim()) newErrors.mobile = 'Phone number is required';
        // Basic phone validation
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
            newErrors.mobile = 'Please enter a valid 10-digit phone number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate before submission
        if (!validateForm()) {
            toast.error('Please fill all required fields correctly');
            return;
        }

        // OPTIMIZED FOR GUEST CHECKOUT - NO UNNECESSARY API CALLS
        // Just update parent component and show success message
        if (onAddressChange && typeof onAddressChange === 'function') {
            onAddressChange(formData);
        }
        toast.success('Address saved successfully');
    };

    return (
        <div>
            <Grid container spacing={4}>
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
                        inputProps={{ 
                            pattern: "[a-zA-Z\\s'-]+",
                            title: "Only letters, spaces, hyphens, and apostrophes allowed"
                        }}
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
                    <Box className="border rounded-s-md shadow-md p-5">
                        {/* ✅ SIMPLIFIED FOR GUEST CHECKOUT */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">Enter Your Delivery Address</p>
                                <p className="text-xs text-gray-500">Fill in the form below to continue</p>
                            </div>
                        </div>
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