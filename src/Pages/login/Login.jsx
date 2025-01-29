import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, ButtonGroup, Nav } from 'react-bootstrap';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../../firebase'; // Import Firebase config file
import './Login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('admin'); // User type: admin or delivery
  const [isLogin, setIsLogin] = useState(true); // Login or Signup state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    vehicleType: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});

  // Form Validation Function
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^\d{10}$/;

    // Validate username and password
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    // Validate additional fields for delivery partner signup
    if (!isLogin && userType === 'delivery') {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email address';

      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
      else if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = 'Phone number must be 10 digits';

      if (!formData.vehicleType) newErrors.vehicleType = 'Please select a vehicle type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const auth = getAuth();
    if (isLogin && userType === 'admin') {
      try {
        // Perform Firebase email/password login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.username, // Assuming username is the email
          formData.password
        );
        console.log('Login successful:', userCredential.user);
        alert('Welcome Admin!');
        navigate('/Admin'); // Redirect to admin dashboard
      } catch (error) {
        console.error('Login error:', error.message);
        setErrors({ form: 'Invalid username or password. Please try again.' });
      }
    } else {
      // Handle sign-up for delivery partner (if implemented)
      alert('Delivery Partner Signup is not implemented.');
    }
  };

  // Handle User Type Change
  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({
      username: '',
      password: '',
      email: '',
      phoneNumber: '',
      vehicleType: '',
      rememberMe: false,
    });
    setErrors({});
  };

  // Render Additional Signup Fields for Delivery Partner
  const renderDeliverySignupFields = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-envelope"></i>
          </span>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        {errors.email && <div className="text-danger">{errors.email}</div>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Phone Number</Form.Label>
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-phone"></i>
          </span>
          <Form.Control
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
        </div>
        {errors.phoneNumber && <div className="text-danger">{errors.phoneNumber}</div>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Vehicle Type</Form.Label>
        <Form.Select
          value={formData.vehicleType}
          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
        >
          <option value="">Select vehicle type</option>
          <option value="bicycle">Bicycle</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="car">Car</option>
          <option value="van">Van</option>
        </Form.Select>
        {errors.vehicleType && <div className="text-danger">{errors.vehicleType}</div>}
      </Form.Group>
    </>
  );

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Container className="my-auto py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5}>
            <div className="localstore-header">
              <h1 className="fw-bold">LocalStore</h1>
            </div>

            <Card className="shadow-lg">
              <Card.Body className="p-4">
                <h4 className="text-center mb-3">
                  {isLogin ? 'Sign In' : 'Sign Up as Delivery Partner'}
                </h4>

                {isLogin && (
                  <ButtonGroup className="d-flex mb-4">
                    <Button
                      variant={userType === 'admin' ? 'primary' : 'outline-primary'}
                      onClick={() => handleUserTypeChange('admin')}
                      className="flex-grow-1"
                    >
                      <i className="bi bi-graph-up me-2"></i>
                      Admin
                    </Button>
                    <Button
                      variant={userType === 'delivery' ? 'primary' : 'outline-primary'}
                      onClick={() => handleUserTypeChange('delivery')}
                      className="flex-grow-1"
                    >
                      <i className="bi bi-truck me-2"></i>
                      Delivery Partner
                    </Button>
                  </ButtonGroup>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    {errors.username && <div className="text-danger">{errors.username}</div>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    {errors.password && <div className="text-danger">{errors.password}</div>}
                  </Form.Group>

                  {!isLogin && renderDeliverySignupFields()}

                  {isLogin && (
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check
                        type="checkbox"
                        id="remember-me"
                        label="Remember me"
                        checked={formData.rememberMe}
                        onChange={(e) =>
                          setFormData({ ...formData, rememberMe: e.target.checked })
                        }
                      />
                      <Button variant="link" className="text-decoration-none p-0">
                        Forgot password?
                      </Button>
                    </div>
                  )}

                  {errors.form && <div className="text-danger mb-3">{errors.form}</div>}

                  <Button variant="primary" type="submit" className="w-100 mb-3">
                    {isLogin
                      ? `Login as ${userType === 'admin' ? 'Admin' : 'Delivery Partner'}`
                      : 'Sign Up as Delivery Partner'}
                  </Button>

                  {userType === 'delivery' && (
                    <div className="text-center">
                      <Button
                        variant="link"
                        className="text-decoration-none"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setFormData({
                            username: '',
                            password: '',
                            email: '',
                            phoneNumber: '',
                            vehicleType: '',
                            rememberMe: false,
                          });
                          setErrors({});
                        }}
                      >
                        {isLogin
                          ? "Don't have an account? Sign up as delivery partner"
                          : 'Already have an account? Sign in'}
                      </Button>
                    </div>
                  )}
                </Form>
              </Card.Body>

              <Card.Footer className="text-center py-3 bg-light">
                <Nav className="justify-content-center mb-2">
                  <Nav.Item>
                    <Nav.Link href="#" className="px-2 text-muted">
                      Privacy Policy
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href="#" className="px-2 text-muted">
                      Terms of Service
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href="#" className="px-2 text-muted">
                      Support
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <small className="text-muted">© 2024 LocalStore. All rights reserved.</small>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
