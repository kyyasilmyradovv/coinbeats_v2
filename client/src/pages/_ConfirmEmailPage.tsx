// src/pages/ConfirmEmailPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Page, Block, BlockTitle } from 'konsta/react';

const ConfirmEmailPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirmEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');

      try {
        const response = await axiosInstance.get(`/api/users/confirm-email?token=${token}`);
        if (response.status === 200) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Email confirmation failed:', error);
        setStatus('error');
      }
    };

    confirmEmail();
  }, [location.search]);

  useEffect(() => {
    if (status === 'success') {
      // Signal the registration page to redirect
      window.opener.postMessage('emailConfirmed', '*');

      // Close the window after 3 seconds
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, [status]);

  return (
    <Page>
      <Block strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6">
        {status === 'loading' && <BlockTitle large>Confirming your email...</BlockTitle>}
        {status === 'success' && (
          <>
            <BlockTitle large>Email Confirmation Successful!</BlockTitle>
            <p>Your email has been successfully confirmed. This window will close shortly.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <BlockTitle large>Email Confirmation Failed</BlockTitle>
            <p>There was an issue confirming your email. Please try again or contact support.</p>
          </>
        )}
      </Block>
    </Page>
  );
};

export default ConfirmEmailPage;
