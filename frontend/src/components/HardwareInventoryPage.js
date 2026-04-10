/**
 * Hardware Inventory Page Component
 * ==================================
 * Displays available hardware sets with real-time availability.
 * Allows users to check out and check in hardware for their projects.
 * Uses Material UI components for a modern, beautiful UI.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Build as BuildIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { getHardwareSets, checkOutHardware, checkInHardware, createHardwareSet, deleteHardwareSet } from '../services/hardwareService';
import { getUserProjects } from '../services/projectService';

function HardwareInventoryPage({ username, userRole, onLogout }) {
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const navigate = useNavigate();
  
  // State management
  const [hardwareSets, setHardwareSets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Checkout/Checkin form state
  const [selectedHardware, setSelectedHardware] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isCheckoutMode, setIsCheckoutMode] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(''); // Error displayed inside the dialog

  // Create hardware set dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newHwName, setNewHwName] = useState('');
  const [newHwCapacity, setNewHwCapacity] = useState('');
  const [newHwDescription, setNewHwDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Menu state for admin actions
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuHardware, setMenuHardware] = useState(null);

  // Load hardware sets and projects on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hardwareResponse, projectsResponse] = await Promise.all([
        getHardwareSets(),
        getUserProjects()
      ]);

      if (hardwareResponse.success) {
        setHardwareSets(hardwareResponse.hardware_sets || []);
      } else {
        setError(hardwareResponse.error || 'Failed to load hardware');
      }

      if (projectsResponse.success) {
        setProjects(projectsResponse.projects || []);
      }
    } catch (err) {
      setError('An error occurred while loading data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProject || !quantity) {
      setFormError('Please select a project and enter quantity');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Please enter a valid quantity');
      return;
    }

    if (qty > selectedHardware.available) {
      setFormError('Insufficient hardware available');
      return;
    }

    try {
      setFormLoading(true);
      const response = await checkOutHardware(
        selectedProject,
        selectedHardware.hw_name,
        qty
      );

      if (response.success) {
        setSelectedHardware(null);
        setQuantity('');
        setSelectedProject('');
        loadData();
      } else {
        setFormError(response.error || 'Failed to checkout hardware');
      }
    } catch (err) {
      setFormError('An error occurred during checkout');
      console.error('Checkout error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCheckin = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProject || !quantity) {
      setFormError('Please select a project and enter quantity');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Please enter a valid quantity');
      return;
    }

    try {
      setFormLoading(true);
      const response = await checkInHardware(
        selectedProject,
        selectedHardware.hw_name,
        qty
      );

      if (response.success) {
        setSelectedHardware(null);
        setQuantity('');
        setSelectedProject('');
        loadData();
      } else {
        setFormError(response.error || 'Failed to check in hardware');
      }
    } catch (err) {
      setFormError('An error occurred during check-in');
      console.error('Check-in error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateHardware = async (e) => {
    e.preventDefault();
    setError('');
    setCreateLoading(true);

    const capacity = parseInt(newHwCapacity);
    if (!newHwName.trim()) {
      setError('Hardware name is required');
      setCreateLoading(false);
      return;
    }
    if (isNaN(capacity) || capacity <= 0) {
      setError('Total capacity must be a positive number');
      setCreateLoading(false);
      return;
    }

    try {
      const response = await createHardwareSet(newHwName.trim(), capacity, newHwDescription.trim());
      if (response.success) {
        setShowCreateDialog(false);
        setNewHwName('');
        setNewHwCapacity('');
        setNewHwDescription('');
        loadData();
      } else {
        setError(response.error || 'Failed to create hardware set');
      }
    } catch (err) {
      setError('An error occurred while creating hardware set');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteHardware = async (hwName) => {
    if (!window.confirm(`Delete hardware set "${hwName}"? This cannot be undone.`)) return;
    setError('');
    setMenuAnchorEl(null);
    try {
      const response = await deleteHardwareSet(hwName);
      if (response.success) {
        loadData();
      } else {
        setError(response.error || 'Failed to delete hardware set');
      }
    } catch (err) {
      setError('An error occurred while deleting hardware set');
    }
  };

  

const openForm = (hardware, isCheckout) => {
    setSelectedHardware(hardware);
    setIsCheckoutMode(isCheckout);
    setFormError('');
    setQuantity('');
    setSelectedProject('');
  };

  const handleMenuOpen = (event, hardware) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuHardware(hardware);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuHardware(null);
  };

  // Calculate availability percentage for progress bar
  const getAvailabilityPercent = (hardware) => {
    return Math.round((hardware.available / hardware.total_capacity) * 100);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header/AppBar */}
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/portal')}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                mr: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Back
            </Button>
            <BuildIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              Hardware Inventory
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateDialog(true)}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Add Hardware
              </Button>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ color: 'white' }}>
                {username}
              </Typography>
              {isAdmin && (
                <Chip
                  icon={<AdminIcon />}
                  label="Admin"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={50} />
          </Box>
        ) : hardwareSets.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 3,
            }}
          >
            <InventoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No hardware sets available
            </Typography>
            {isAdmin ? (
              <Typography variant="body2" color="text.secondary">
                Click "Add Hardware" in the top right to create a new hardware set.
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Contact an administrator to add hardware sets.
              </Typography>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {hardwareSets.map((hardware) => {
              const availabilityPercent = getAvailabilityPercent(hardware);

              return (
                <Grid item xs={12} sm={6} lg={4} xl={3} key={hardware.hw_name}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Hardware Header */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 50, height: 50 }}>
                          <BuildIcon sx={{ color: 'white' }} />
                        </Avatar>
                        {isAdmin && (
                          <IconButton onClick={(e) => handleMenuOpen(e, hardware)}>
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </Stack>

                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                        {hardware.hw_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {hardware.description || 'No description'}
                      </Typography>

                      {/* Stats - Clean horizontal layout */}
                      <Stack direction="row" spacing={2} sx={{ mb: 2, py: 1.5, px: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                            Total
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {hardware.total_capacity}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                            Available
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: hardware.available > 0 ? 'success.main' : 'error.main' }}>
                            {hardware.available}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                            In Use
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                            {hardware.checked_out}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Availability Progress Bar */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Availability: {availabilityPercent}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={availabilityPercent}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: availabilityPercent > 50 ? 'success.main' : availabilityPercent > 20 ? 'warning.main' : 'error.main',
                            },
                          }}
                        />
                      </Box>
                    </CardContent>

                    {/* Action Buttons */}
                    <Divider />
                    <CardActions sx={{ justifyContent: 'center', py: 2, gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<RemoveCircleIcon />}
                        onClick={() => openForm(hardware, true)}
                        disabled={hardware.available === 0}
                        color="primary"
                        size="small"
                      >
                        Check Out
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => openForm(hardware, false)}
                        color="success"
                        size="small"
                      >
                        Check In
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Create Hardware Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Create Hardware Set</Typography>
          <IconButton onClick={() => setShowCreateDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Hardware Name"
            value={newHwName}
            onChange={(e) => setNewHwName(e.target.value)}
            placeholder="e.g. Arduino Uno"
            required
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Total Capacity"
            type="number"
            value={newHwCapacity}
            onChange={(e) => setNewHwCapacity(e.target.value)}
            placeholder="e.g. 50"
            required
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 1 } }}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={newHwDescription}
            onChange={(e) => setNewHwDescription(e.target.value)}
            placeholder="e.g. Microcontroller board"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateHardware}
            disabled={createLoading || !newHwName.trim() || !newHwCapacity}
          >
            {createLoading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Checkout/Checkin Dialog */}
      <Dialog open={selectedHardware !== null} onClose={() => setSelectedHardware(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {isCheckoutMode ? 'Check Out' : 'Check In'} {selectedHardware?.hw_name}
          </Typography>
          <IconButton onClick={() => setSelectedHardware(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Form Error - displayed inside dialog */}
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Select Project</InputLabel>
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              label="Select Project"
              required
            >
              <MenuItem value="">-- Select Project --</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            InputProps={{
              inputProps: {
                min: 1,
                max: isCheckoutMode ? selectedHardware?.available : undefined,
              },
            }}
            helperText={
              isCheckoutMode
                ? `Available: ${selectedHardware?.available}`
                : 'Enter quantity to check in'
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedHardware(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={isCheckoutMode ? 'primary' : 'success'}
            onClick={isCheckoutMode ? handleCheckout : handleCheckin}
            disabled={formLoading || !selectedProject || !quantity}
          >
            {formLoading ? <CircularProgress size={24} /> : isCheckoutMode ? 'Check Out' : 'Check In'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDeleteHardware(menuHardware?.hw_name)}>
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText>Delete Hardware Set</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default HardwareInventoryPage;