import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  Slide,
} from '@mui/material';
import Navbar from '../components/Navbar';
import { History, Send, GetApp, AccountBalanceWallet, CheckCircle } from '@mui/icons-material';
import { ethers } from 'ethers';
import {
  fetchTransactions,
  fetchUserBalance,
  requestWalletChallenge,
  verifyWalletSignature,
  updateWalletAddress,
  sendGold,
  getUserStatistics,
} from '../api';
import { formatGold } from '../goldUtils';

const cardBase = {
  p: { xs: 3, sm: 4 },
  borderRadius: 4,
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
};

function Wallet ({ logout }) {
  const [_currentView, setCurrentView] = useState('main');
  const [userProfile, setUserProfile] = useState(null);
  const [onchainBalance, setOnchainBalance] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [_walletStatus, setWalletStatus] = useState('');
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [sendGoldDialog, setSendGoldDialog] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [statistics, setStatistics] = useState(null);

  // Load user from localStorage when on mount
  useEffect(() => {
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserProfile(user);

    Promise.all([
      fetchUserBalance(user?.wallet_address),
      fetchTransactions(user?.id),
      getUserStatistics(user?.id),
    ])
      .then(([rawBalance, txs, stats]) => {
        const formatted = formatGold(rawBalance);
        setOnchainBalance(formatted);
        setTransactionHistory(txs);
        setStatistics(stats);
      })
      .catch(err => setError(err.message));

    setLoading(false);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  // Top-level wallet connection status
  const isWalletConnected = !!userProfile?.wallet_address;
  const shortWallet = isWalletConnected
    ? `${userProfile.wallet_address.slice(0, 6)}...${userProfile.wallet_address.slice(-4)}`
    : null;

  const connectWallet = async () => {
    const updateWalletStatus = status => setWalletStatus(status);

    if (!window.ethereum) {
      alert('MetaMask not detected. Please install MetaMask!');
      return;
    }

    try {
      setIsWalletLoading(true);
      updateWalletStatus('Connecting to MetaMask...');

      // Connect to MetaMask
      const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      updateWalletStatus('Wallet connected successfully!');

      // Request challenge from backend
      updateWalletStatus('Requesting challenge from server...');
      const challengeData = await requestWalletChallenge(selectedAddress);
      updateWalletStatus('Challenge received. Please sign with MetaMask...');

      // Ask MetaMask to sign the challenge
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(challengeData.challenge);
      updateWalletStatus('Signature created. Verifying...');

      // Send signature to backend for verification
      const verifyData = await verifyWalletSignature(selectedAddress, signature);

      // If verified, update updatedUser both to backend and localStorage
      if (verifyData.verified) {
        updateWalletStatus('Wallet verified! Updating profile...');
        const updatedUser = await updateWalletAddress(selectedAddress);
        setUserProfile(updatedUser);
        updateWalletStatus('Wallet linked to your profile!');
      } else {
        updateWalletStatus('Signature verification failed.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Wallet connection error:', err);
    } finally {
      setIsWalletLoading(false);
    }
  };

  const handleSendGold = async () => {
    if (!sendAmount || !recipientAddress) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const transferData = {
        recipient_address: recipientAddress,
        amount: parseFloat(sendAmount),
        tx_hash: `0x${Date.now().toString(16)}`,
      };

      await sendGold(transferData);
      setSendGoldDialog(false);
      setSendAmount('');
      setRecipientAddress('');

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedTransactions = await fetchTransactions(user?.id);
      setTransactionHistory(updatedTransactions);

      const updatedBalance = await fetchUserBalance(user?.wallet_address);
      setOnchainBalance(formatGold(updatedBalance));
    } catch (err) {
      setError(err.message);
    }
  };

  const _renderMainView = () => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: { xs: 2, sm: 3 },
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {/* Balance Card */}
      <Box
        sx={{
          flex: '0 0 calc(50% - 16px)',
          minWidth: { xs: '280px', sm: '300px' },
          maxWidth: { xs: '100%', sm: 'calc(50% - 16px)' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid #f0f0f0',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ff001e, #d4001a)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 20px 40px rgba(255, 0, 30, 0.1)',
              borderColor: '#ff001e',
              '&::before': {
                opacity: 1,
              },
            },
          }}
        >
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff001e 0%, #d4001a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 8px 32px rgba(255, 0, 30, 0.3)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '3rem',
                  color: '#ffffff',
                  fontWeight: '900',
                }}
              >
                💰
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontWeight: '900',
                color: '#2A2828',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem' },
              }}
              variant='h2'
            >
              {onchainBalance !== null ? `${onchainBalance} GOLD` : '-'}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontWeight: '600',
                color: '#666',
                fontSize: '1.1rem',
              }}
              variant='h6'
            >
              On-chain Balance
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          flex: '0 0 calc(50% - 16px)',
          minWidth: { xs: '280px', sm: '300px' },
          maxWidth: { xs: '100%', sm: 'calc(50% - 16px)' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={3} sx={{ height: '100%' }}>
          <WalletButton
            icon={<History />}
            label='View History'
            onClick={() => setCurrentView('history')}
          />
          <WalletButton icon={<Send />} label='Send Gold' onClick={() => setSendGoldDialog(true)} />
          <WalletButton
            icon={<GetApp />}
            label='Statistics'
            onClick={() => setCurrentView('statistics')}
          />
        </Stack>
      </Box>
    </Box>
  );

  const _renderStatisticsView = () => {
    if (!statistics) {
      return (
        <Grid alignItems='center' container justifyContent='center' spacing={4}>
          <Typography>Loading statistics...</Typography>
        </Grid>
      );
    }

    const totalSpentPercentage =
      statistics.total_spent > 0
        ? Math.round(
          ((statistics.spending_breakdown.events +
              statistics.spending_breakdown.items +
              statistics.spending_breakdown.transfers) /
              statistics.total_spent) *
              100,
        )
        : 0;

    return (
      <Grid alignItems='center' container justifyContent='center' spacing={4}>
        <Grid item md={6} xs={12}>
          <Paper elevation={3} sx={{ ...cardBase, textAlign: 'center', minHeight: '400px' }}>
            <Typography
              sx={{ fontFamily: 'Poppins', fontWeight: 700, color: '#2A2828', mb: 4 }}
              variant='h5'
            >
              Spending Statistics
            </Typography>
            <Box
              sx={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `conic-gradient(#ff001e 0deg ${totalSpentPercentage * 3.6}deg, #f0f0f0 ${totalSpentPercentage * 3.6}deg 360deg)`,
                mx: 'auto',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#2A2828' }}
                  variant='h6'
                >
                  {totalSpentPercentage}%
                </Typography>
              </Box>
            </Box>
            <Typography
              sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#ff001e', textAlign: 'center' }}
              variant='body1'
            >
              Events: {Math.round(statistics.spending_percentage.events)}%
              <br />
              Items: {Math.round(statistics.spending_percentage.items)}%
              <br />
              Transfers: {Math.round(statistics.spending_percentage.transfers)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item md={6} xs={12}>
          <Paper elevation={3} sx={{ ...cardBase, minHeight: '400px' }}>
            <Typography
              sx={{ fontFamily: 'Poppins', fontWeight: 700, color: '#2A2828', mb: 3 }}
              variant='h5'
            >
              Summary
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography
                  sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#4caf50' }}
                  variant='h6'
                >
                  Total Earned: {formatGold(statistics.total_earned)} GOLD
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#ff001e' }}
                  variant='h6'
                >
                  Total Spent: {formatGold(statistics.total_spent)} GOLD
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'Poppins', color: '#666' }} variant='body1'>
                  Events: {formatGold(statistics.spending_breakdown.events)} GOLD
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins', color: '#666' }} variant='body1'>
                  Items: {formatGold(statistics.spending_breakdown.items)} GOLD
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins', color: '#666' }} variant='body1'>
                  Transfers: {formatGold(statistics.spending_breakdown.transfers)} GOLD
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const _renderHistoryView = () => (
    <Grid alignItems='center' container justifyContent='center' spacing={4}>
      <Paper elevation={3} sx={{ ...cardBase }}>
        <Typography
          sx={{ fontFamily: 'Poppins', fontWeight: 700, color: '#2A2828', mb: 4 }}
          variant='h4'
        >
          Transaction History
        </Typography>
        <Stack spacing={3}>
          {transactionHistory.map(tx => (
            <TransactionCard detailed key={tx.id} tx={tx} />
          ))}
        </Stack>
      </Paper>
    </Grid>
  );

  const _renderReceivedView = () => {
    const receivedTransactions = transactionHistory.filter(tx => tx.direction === 'credit');

    return (
      <Grid alignItems='center' container justifyContent='center' spacing={4}>
        <Paper elevation={3} sx={{ ...cardBase }}>
          <Typography
            sx={{ fontFamily: 'Poppins', fontWeight: 700, color: '#2A2828', mb: 4 }}
            variant='h4'
          >
            Received Gold
          </Typography>
          <Stack spacing={3}>
            {receivedTransactions.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: '#666' }} variant='body1'>
                No received transactions yet
              </Typography>
            ) : (
              receivedTransactions.map(tx => <TransactionCard detailed key={tx.id} tx={tx} />)
            )}
          </Stack>
        </Paper>
      </Grid>
    );
  };

  const TransactionCard = ({ tx, detailed }) => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #f0f0f0',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        p: detailed ? 4 : 3,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background:
            tx.direction === 'credit'
              ? 'linear-gradient(90deg, #4caf50, #66bb6a)'
              : 'linear-gradient(90deg, #ff001e, #d4001a)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
          borderColor: tx.direction === 'credit' ? '#4caf50' : '#ff001e',
          '&::before': {
            opacity: 1,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography
            sx={{
              fontFamily: 'Poppins',
              fontWeight: '700',
              color: tx.direction === 'credit' ? '#4caf50' : '#ff001e',
              fontSize: detailed ? '1.5rem' : '1.2rem',
              mb: 1,
            }}
            variant={detailed ? 'h5' : 'h6'}
          >
            {tx.direction === 'credit' ? '+' : '-'}
            {tx.amount} GOLD
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Poppins',
              color: '#666',
              fontSize: detailed ? '0.95rem' : '0.85rem',
              lineHeight: 1.5,
              mb: 1,
            }}
            variant={detailed ? 'body1' : 'body2'}
          >
            {tx.created_at ? new Date(tx.created_at).toLocaleString() : ''}
            <br />
            {tx.description}
          </Typography>
          {tx.tx_hash && (
            <Typography
              sx={{
                fontFamily: 'monospace',
                color: '#888',
                fontSize: '0.75rem',
                backgroundColor: '#f5f5f5',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              variant='caption'
            >
              Tx: {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}
            </Typography>
          )}
          {tx.status && (
            <Chip
              label={tx.status}
              size='small'
              sx={{
                ml: 1,
                backgroundColor:
                  tx.status === 'confirmed'
                    ? '#4caf50'
                    : tx.status === 'failed'
                      ? '#ff001e'
                      : '#ffb300',
                color: '#fff',
                fontFamily: 'Poppins',
                fontWeight: '600',
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );

  const WalletButton = ({ label, icon, onClick }) => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #f0f0f0',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        cursor: 'pointer',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ff001e, #d4001a)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0 12px 32px rgba(255, 0, 30, 0.15)',
          borderColor: '#ff001e',
          '&::before': {
            opacity: 1,
          },
        },
      }}
    >
      <Button
        fullWidth
        onClick={onClick}
        startIcon={icon}
        sx={{
          py: 3,
          px: 4,
          fontSize: '1.1rem',
          fontWeight: 700,
          fontFamily: 'Poppins',
          borderRadius: '20px',
          textTransform: 'none',
          backgroundColor: 'transparent',
          color: '#2A2828',
          '&:hover': {
            backgroundColor: 'transparent',
          },
          '& .MuiButton-startIcon': {
            fontSize: '1.5rem',
            color: '#ff001e',
          },
        }}
        variant='text'
      >
        {label}
      </Button>
    </Paper>
  );

  return (
    <>
      <Navbar logout={logout} />

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 64,
            left: 0,
            width: '100%',
            zIndex: 2000,
            bgcolor: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            py: 2,
          }}
        >
          <Typography variant='body1'>Loading items...</Typography>
        </Box>
      )}

      {/* Main Content */}
      <Box
        sx={{
          backgroundColor: '#fafafa',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #ff001e 0%, #d4001a 100%)',
            height: '500px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>\')',
              opacity: 0.3,
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              width: '100%',
              maxWidth: '800px',
              px: 4,
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontWeight: '900',
                color: '#ffffff',
                mb: 3,
                fontSize: { xs: '3rem', md: '4.5rem' },
                textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                letterSpacing: '-0.02em',
                animation: 'fadeInUp 0.8s ease-out',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(30px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
              variant='h1'
            >
              💰 My Wallet
            </Typography>

            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontWeight: '400',
                color: 'rgba(255,255,255,0.95)',
                mb: 6,
                fontSize: '1.3rem',
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.5,
              }}
              variant='h5'
            >
              Manage your GOLD balance and track your transactions
            </Typography>
          </Box>
        </Box>

        {/* Floating Wallet Status Section */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            mt: -8,
            mb: 8,
          }}
        >
          <Box
            sx={{
              maxWidth: '1200px',
              mx: 'auto',
              px: 4,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                p: 4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 40px rgba(255, 0, 30, 0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 25px 80px rgba(0,0,0,0.15), 0 0 60px rgba(255, 0, 30, 0.15)',
                },
              }}
            >
              {/* Top-level wallet connection status */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {isWalletConnected ? (
                  <Chip
                    color='success'
                    icon={<CheckCircle />}
                    label={`Connected: ${shortWallet}`}
                    sx={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      py: 2,
                      px: 2,
                      backgroundColor: 'rgba(76, 175, 80, 0.9)',
                      color: 'white',
                      '& .MuiChip-icon': { fontSize: '18px', color: 'white' },
                      '& .MuiChip-label': { px: 1 },
                    }}
                    variant='filled'
                  />
                ) : (
                  <Button
                    disabled={isWalletLoading}
                    onClick={connectWallet}
                    size='large'
                    startIcon={
                      isWalletLoading ? (
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                      ) : (
                        <AccountBalanceWallet />
                      )
                    }
                    sx={{
                      background: isWalletLoading
                        ? 'linear-gradient(45deg, #9E9E9E 30%, #757575 90%)'
                        : 'linear-gradient(45deg, #ff001e 30%, #d4001a 90%)',
                      border: 0,
                      borderRadius: 3,
                      boxShadow: isWalletLoading
                        ? '0 2px 8px rgba(158, 158, 158, 0.3)'
                        : '0 3px 15px rgba(255, 0, 30, 0.4)',
                      color: 'white',
                      height: 56,
                      padding: '0 30px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        background: isWalletLoading
                          ? 'linear-gradient(45deg, #9E9E9E 30%, #757575 90%)'
                          : 'linear-gradient(45deg, #d4001a 30%, #b30017 90%)',
                        boxShadow: isWalletLoading
                          ? '0 2px 8px rgba(158, 158, 158, 0.3)'
                          : '0 4px 20px rgba(255, 0, 30, 0.5)',
                        transform: isWalletLoading ? 'none' : 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(45deg, #9E9E9E 30%, #757575 90%)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        cursor: 'not-allowed',
                      },
                    }}
                    variant='contained'
                  >
                    <Typography fontWeight='bold' variant='button'>
                      {isWalletLoading ? 'Connecting...' : 'Connect Wallet'}
                    </Typography>
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Dialog
        PaperProps={{
          sx: {
            borderRadius: '40px',
            backgroundColor: '#ffffff',
            boxShadow: '0 60px 160px rgba(0,0,0,0.25), 0 0 100px rgba(255, 0, 30, 0.2)',
            border: '1px solid rgba(255,255,255,0.4)',
            overflow: 'hidden',
            position: 'relative',
            maxHeight: '90vh',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(248,249,255,0.1) 100%)',
              pointerEvents: 'none',
              zIndex: 0,
            },
          },
        }}
        TransitionComponent={Slide}
        fullWidth
        keepMounted
        maxWidth='sm'
        onClose={() => setSendGoldDialog(false)}
        open={sendGoldDialog}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #ff001e 0%, #d4001a 100%)',
            color: '#ffffff',
            fontFamily: 'Poppins',
            fontWeight: '900',
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
            textAlign: 'center',
            py: { xs: 3, sm: 4, md: 5 },
            px: { xs: 4, sm: 5, md: 6 },
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.15"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>\')',
              opacity: 0.4,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
              borderRadius: '2px',
            },
          }}
        >
          <Box alignItems='center' display='flex' justifyContent='center'>
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontWeight: '900',
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 1,
                letterSpacing: '-0.02em',
              }}
            >
              💸 Send Gold
            </Typography>
          </Box>
        </DialogTitle>
        <Box
          sx={{
            py: { xs: 4, sm: 5, md: 6 },
            px: { xs: 3, sm: 4, md: 5 },
            textAlign: 'center',
            maxHeight: '60vh',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 0, 30, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255, 0, 30, 0.5)',
              },
            },
          }}
        >
          <TextField
            autoFocus
            fullWidth
            label='Recipient Wallet Address'
            margin='dense'
            onChange={e => setRecipientAddress(e.target.value)}
            placeholder='0x...'
            sx={{
              mb: 3,
              fontFamily: 'Poppins',
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                fontFamily: 'Poppins',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: '2px',
                },
                '&:hover fieldset': {
                  borderColor: '#ff001e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff001e',
                },
              },
            }}
            value={recipientAddress}
            variant='outlined'
          />
          <TextField
            fullWidth
            inputProps={{ min: 0, step: 0.1 }}
            label='Amount (GOLD)'
            margin='dense'
            onChange={e => setSendAmount(e.target.value)}
            sx={{
              mb: 3,
              fontFamily: 'Poppins',
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                fontFamily: 'Poppins',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: '2px',
                },
                '&:hover fieldset': {
                  borderColor: '#ff001e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff001e',
                },
              },
            }}
            type='number'
            value={sendAmount}
            variant='outlined'
          />
        </Box>
        <DialogActions
          sx={{
            justifyContent: 'center',
            pb: { xs: 4, sm: 5, md: 6 },
            pt: { xs: 2, sm: 3, md: 4 },
            px: { xs: 3, sm: 4, md: 5 },
            gap: { xs: 2, sm: 3 },
          }}
        >
          <Button
            onClick={() => setSendGoldDialog(false)}
            sx={{
              fontFamily: 'Poppins',
              textTransform: 'none',
              borderRadius: '12px',
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              border: '2px solid #e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#ff001e',
                color: '#ff001e',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendGold}
            sx={{
              background: 'linear-gradient(45deg, #ff001e, #d4001a)',
              borderRadius: '12px',
              textTransform: 'none',
              fontFamily: 'Poppins',
              fontWeight: '600',
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              boxShadow: '0 4px 12px rgba(255, 0, 30, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(45deg, #d4001a, #b30017)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(255, 0, 30, 0.4)',
              },
            }}
            variant='contained'
          >
            Send Gold
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Wallet;
