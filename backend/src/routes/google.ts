import axios from 'axios';
import { Router } from 'express';
import env, { isGoogleOAuthConfigured } from '../config/env';

const router = Router();

let googleAccessToken: string | null = null;

const GOOGLE_FIT_SCOPE = 'https://www.googleapis.com/auth/fitness.activity.read';

router.get('/google/connect', (_req, res) => {
  if (!isGoogleOAuthConfigured()) {
    res.status(503).json({
      message: 'Google integration is not configured on this server.',
    });
    return;
  }

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_FIT_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get('/google/callback', async (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    res.status(503).send('Google integration is not configured on this server.');
    return;
  }

  try {
    const code = req.query.code;
    if (typeof code !== 'string' || !code.trim()) {
      res.status(400).send('Missing authorization code.');
      return;
    }

    const tokenParams = new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      tokenParams.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    const accessToken = tokenResponse.data?.access_token;
    if (typeof accessToken !== 'string' || !accessToken) {
      console.error('Google token exchange succeeded but access_token is missing', tokenResponse.data);
      res.status(500).send('OAuth succeeded but no access token was returned.');
      return;
    }

    googleAccessToken = accessToken;
    res.status(200).send('Google Fit connected successfully. You can close this tab.');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Google OAuth callback token exchange failed', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('Google OAuth callback failed', error);
    }

    res.status(500).send('Failed to complete Google OAuth callback.');
  }
});

router.get('/google/steps', async (_req, res) => {
  if (!isGoogleOAuthConfigured()) {
    res.status(503).json({
      message: 'Google integration is not configured on this server.',
    });
    return;
  }

  try {
    if (!googleAccessToken) {
      res.status(400).json({
        message: 'Google is not connected yet. Visit /api/google/connect first.',
      });
      return;
    }

    const endTimeMillis = Date.now();
    const startTimeMillis = endTimeMillis - 24 * 60 * 60 * 1000;

    const response = await axios.post(
      'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis,
        endTimeMillis,
      },
      {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Google Fit steps fetch failed', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('Google Fit steps fetch failed', error);
    }

    res.status(500).json({
      message: 'Failed to fetch steps data from Google Fit.',
    });
  }
});

export default router;
