"use client";

import { useCallback, useEffect, useState } from "react";

type PaystackPopupOptions = {
  key: string;
  email: string;
  amount: number;
  ref: string;
  onClose: () => void;
  callback: (response: { reference: string; status: string }) => void;
};

type PaystackPopupHandler = {
  openIframe: () => void;
};

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackPopupOptions) => PaystackPopupHandler;
    };
  }
}

let paystackScriptPromise: Promise<void> | null = null;

function loadPaystackScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.PaystackPop) {
    return Promise.resolve();
  }

  if (!paystackScriptPromise) {
    paystackScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paystack"));
      document.body.appendChild(script);
    });
  }

  return paystackScriptPromise;
}

type UsePaystackPopupResult = {
  isReady: boolean;
  isOpening: boolean;
  openCheckout: (options: {
    publicKey: string;
    email: string;
    amount: number;
    reference: string;
    onSuccess: (reference: string) => void;
    onClose?: () => void;
  }) => Promise<void>;
};

export function usePaystackPopup(): UsePaystackPopupResult {
  const [isReady, setIsReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    void loadPaystackScript()
      .then(() => setIsReady(true))
      .catch(() => setIsReady(false));
  }, []);

  const openCheckout = useCallback<UsePaystackPopupResult["openCheckout"]>(
    async ({ publicKey, email, amount, reference, onSuccess, onClose }) => {
      await loadPaystackScript();

      if (!window.PaystackPop) {
        throw new Error("Paystack is not available");
      }

      setIsOpening(true);

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount,
        ref: reference,
        onClose: () => {
          setIsOpening(false);
          onClose?.();
        },
        callback: (response) => {
          setIsOpening(false);
          onSuccess(response.reference);
        },
      });

      handler.openIframe();
    },
    []
  );

  return { isReady, isOpening, openCheckout };
}
