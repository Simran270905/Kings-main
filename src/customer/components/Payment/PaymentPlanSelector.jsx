import React from 'react'
import { CreditCardIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

// Inline formatPrice function to bypass import issues
const formatPrice = (value) => {
  const num = Number(value);
  return `₹${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`;
};

const safeNum = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

export default function PaymentPlanSelector({ 
  selectedPlan, 
  onPlanChange, 
  totalAmount, 
  paymentMethod,
  paymentCalculation,
  disabled = false 
}) {
  const handlePlanChange = (plan) => {
    if (!disabled) {
      onPlanChange(plan)
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCardIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Payment Plan</h3>
      </div>

      <div className="space-y-3">
        {/* Full Payment Option */}
        <div
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedPlan === 'full'
              ? 'border-[#ae0b0b] bg-[#ffe9e9] text-[#950000]'
              : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => handlePlanChange('full')}
        >
          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="paymentPlan"
                value="full"
                checked={selectedPlan === 'full'}
                onChange={() => handlePlanChange('full')}
                disabled={disabled}
                className="h-4 w-4 text-[#ae0b0b] focus:ring-[#ae0b0b] border-gray-300"
              />
            </div>
            <div className="ml-3 flex-1">
              <label className="font-medium cursor-pointer">
                Full Payment
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Pay the complete amount now
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{formatPrice(paymentCalculation.finalAmount)}</p>
              <p className="text-xs text-gray-500">One-time payment</p>
              {paymentCalculation.hasDiscount && (
                <p className="text-xs text-green-600">10% discount applied</p>
              )}
              {paymentCalculation.hasCODCharge && (
                <p className="text-xs text-orange-600">+₹{safeNum(paymentCalculation.codCharge)} COD charge</p>
              )}
            </div>
          </div>
        </div>

        {/* Partial Payment Option */}
        <div
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedPlan === 'partial'
              ? 'border-[#ae0b0b] bg-[#ffe9e9] text-[#950000]'
              : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => handlePlanChange('partial')}
        >
          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="paymentPlan"
                value="partial"
                checked={selectedPlan === 'partial'}
                onChange={() => handlePlanChange('partial')}
                disabled={disabled}
                className="h-4 w-4 text-[#ae0b0b] focus:ring-[#ae0b0b] border-gray-300"
              />
            </div>
            <div className="ml-3 flex-1">
              <label className="font-medium cursor-pointer">
                Partial Payment – Pay {paymentCalculation.advancePercent || 10}% now, {paymentCalculation.remainingPercent || 90}% later
              </label>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pay Now ({paymentCalculation.advancePercent}%):</span>
                  <span className="font-medium text-green-600">{formatPrice(paymentCalculation.advanceAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pay Later ({paymentCalculation.remainingPercent}%):</span>
                  <span className="font-medium text-orange-600">{formatPrice(paymentCalculation.remainingAmount)}</span>
                </div>
                {paymentCalculation.hasCODCharge && (
                  <p className="text-xs text-orange-600 mt-1">Includes ₹{safeNum(paymentCalculation.codCharge)} COD charge</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partial Payment Info Note */}
      {selectedPlan === 'partial' && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">💳 Pay just 10% now, rest 90% later!</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Remaining amount must be paid before your order is shipped</li>
                <li>• For UPI/Netbanking: 10% discount applies first, then 10/90 split</li>
                <li>• For COD/Card: No discount, direct 10/90 split on original amount</li>
                <li>• You will receive a payment reminder for the remaining amount</li>
                <li>• Order processing begins after advance payment confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Full Payment Note */}
      {selectedPlan === 'full' && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Benefits of Full Payment:</p>
              <ul className="space-y-1 text-green-700">
                <li>• Eligible for 10% prepaid discount on UPI/NetBanking</li>
                <li>• Order processing starts immediately</li>
                <li>• No additional payment steps required</li>
                <li>• Faster order fulfillment</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
