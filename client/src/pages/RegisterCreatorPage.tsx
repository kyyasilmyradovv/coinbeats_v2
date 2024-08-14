import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import useUserStore from '../store/useUserStore';
import useSessionStore from '../store/useSessionStore';
import { Page, List, ListInput, Button, BlockTitle, Block } from 'konsta/react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { Icon } from '@iconify/react';

const RegisterCreatorPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
  const navigate = useNavigate();
  const { userId: telegramUserId, username } = useSessionStore((state) => ({
    userId: state.userId,
    username: state.username,
  }));
  const { setUser, updateUserRole } = useUserStore((state) => ({
    setUser: state.setUser,
    updateUserRole: state.updateUserRole,
  }));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isRegistrationSuccessful, setIsRegistrationSuccessful] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClearField = (field: keyof typeof formData) => {
    setFormData({
      ...formData,
      [field]: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await axiosInstance.post('/api/users/register-creator', {
        telegramUserId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201 || response.status === 200) {
        setIsRegistrationSuccessful(true);
      }
    } catch (error: any) {
      console.error('Registration failed:', error.response ? error.response.data : error.message);
      alert(error.response?.data?.error || 'Failed to register as a creator');
    }
  };

  useEffect(() => {
    if (isRegistrationSuccessful) {
      const source = new EventSource(`/api/sse/email-confirmation-status?userId=${telegramUserId}`);

      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.emailConfirmed) {
          navigate('/login');
          source.close(); // Close the connection after receiving the confirmation
        }
      };

      source.onerror = () => {
        console.error('Error in SSE connection');
        source.close();
      };

      return () => {
        source.close(); // Clean up the connection when the component is unmounted
      };
    }
  }, [isRegistrationSuccessful, navigate, telegramUserId]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={() => setRightPanelOpened(!rightPanelOpened)} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
        theme={theme}
        setTheme={setTheme}
        setColorTheme={setColorTheme}
      />

      <div className="text-center flex w-full items-center justify-center top-8 mb-10">
        <BlockTitle large>Register as Academy Creator</BlockTitle>
      </div>

      <Block strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6">
        {isRegistrationSuccessful ? (
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-4">
              Thank you for registering! Please confirm your email by clicking the link sent to your email.
            </h2>
            <div className="flex justify-center">
              <Icon icon="svg-spinners:blocks-shuffle-3" className="text-[#DE47F0]" width="24" height="24" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <List className="rounded-2xl">
              <ListInput
                label="Name"
                type="text"
                placeholder="Enter your name"
                outline
                clearButton
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                onClear={() => handleClearField('name')}
                className="rounded-2xl"
              />
              <ListInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                outline
                clearButton
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                onClear={() => handleClearField('email')}
                className="rounded-2xl"
              />
              <ListInput
                label="Password"
                type={showPassword ? 'text' : 'password'} // Toggle between text and password
                placeholder="Enter your password"
                outline
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                onClear={() => handleClearField('password')}
                className="rounded-2xl"
                inputClassName="pr-12" // Space for the icon
              >
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-4 top-[63%] transform -translate-y-1/2 px-3 flex items-center text-gray-500 focus:outline-none"
                >
                  <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} width="20" height="20" />
                </button>
              </ListInput>
              <ListInput
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'} // Toggle between text and password
                placeholder="Confirm your password"
                outline
                required
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onClear={() => handleClearField('confirmPassword')}
                className="rounded-2xl"
                inputClassName="pr-12" // Space for the icon
              >
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-4 top-[90%] transform -translate-y-1/2 px-3 flex items-center text-gray-500 focus:outline-none"
                >
                  <Icon icon={showConfirmPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} width="20" height="20" />
                </button>
              </ListInput>
            </List>
            <Button
              type="submit"
              large
              raised
              strong
              className="w-full rounded-2xl"
            >
              Register
            </Button>
          </form>
        )}
      </Block>
    </Page>
  );
};

export default RegisterCreatorPage;
