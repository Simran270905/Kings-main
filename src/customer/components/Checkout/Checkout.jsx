import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/useCart';
import DeliveryAddressForm from './DeliveryAddress';
import OrderSummary from './OrderSummary';
import Payment from '../Payment/Payment';
import { CheckIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const steps = [
  { label: 'Delivery Address', description: 'Where to send your order' },
  { label: 'Order Summary', description: 'Review your items' },
  { label: 'Payment', description: 'Complete your purchase' },
];

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const querySearch = new URLSearchParams(location.search);
  const urlStep = parseInt(querySearch.get('step')) || 1;
  // Steps are 1-indexed in URL; convert to 0-indexed internally
  const [activeStep, setActiveStep] = React.useState(Math.max(0, urlStep - 1));

  const [deliveryAddress, setDeliveryAddress] = React.useState({
    firstName: '', lastName: '', email: '', streetAddress: '',
    city: '', state: '', zipCode: '', mobile: '',
  });

  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  React.useEffect(() => {
    setActiveStep(Math.max(0, urlStep - 1));
  }, [urlStep]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (!deliveryAddress.firstName || !deliveryAddress.lastName || !deliveryAddress.email ||
          !deliveryAddress.streetAddress || !deliveryAddress.mobile) {
        toast.error('Please fill all required fields');
        return;
      }
    }
    const next = activeStep + 1;
    setActiveStep(next);
    navigate(`?step=${next + 1}`, { replace: true });
  };

  const handleBack = () => {
    const prev = activeStep - 1;
    setActiveStep(prev);
    navigate(`?step=${prev + 1}`, { replace: true });
  };

  const isComplete = activeStep >= steps.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  index < activeStep
                    ? 'bg-green-500 text-white'
                    : index === activeStep
                    ? 'bg-[#ae0b0b] text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < activeStep
                    ? <CheckIcon className="h-5 w-5" />
                    : index + 1}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <p className={`text-xs font-semibold ${
                    index === activeStep ? 'text-[#ae0b0b]' : 'text-gray-500'
                  }`}>{step.label}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 mb-6 ${
                  index < activeStep ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        {isComplete ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500 mb-8">Thank you for your purchase. We'll send a confirmation shortly.</p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-[#ae0b0b] text-white font-bold rounded-xl hover:bg-[#8f0a0a] transition-colors"
            >Continue Shopping</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[300px]">
              {activeStep === 0 && (
                <DeliveryAddressForm
                  address={deliveryAddress}
                  onAddressChange={setDeliveryAddress}
                />
              )}
              {activeStep === 1 && <OrderSummary address={deliveryAddress} />}
              {activeStep === 2 && <Payment deliveryAddress={deliveryAddress} />}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-[#ae0b0b] text-white font-bold rounded-xl hover:bg-[#8f0a0a] transition-colors shadow-lg shadow-[#ae0b0b]/20"
              >
                {activeStep === steps.length - 1 ? 'Place Order' : 'Continue →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
