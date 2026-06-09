import React, { useEffect, useRef } from 'react';

export default function RazorpayButton() {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Check if the script is already added to prevent duplicates
    if (formRef.current && formRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', 'pl_SzR072KFkZFvXe');
      script.async = true;
      formRef.current.appendChild(script);
    }
  }, []);

  return (
    <form ref={formRef} className="flex justify-center items-center my-4"></form>
  );
}