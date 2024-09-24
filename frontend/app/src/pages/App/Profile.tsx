import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../services/user/user';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import '../../styles/Profile.css';

interface ProfileUser {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

const Profile: React.FC = () => {
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [editedUser, setEditedUser] = useState<ProfileUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {      
    const fetchUserDetails = async () => {
      if (user) {
        try {
          const userDetails = await UserService.getUserDetails(user._id);
          setProfileUser(userDetails);
          setEditedUser(userDetails);
        } catch (err) {
          setError('Failed to fetch user details');
        }                                      
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editedUser || !user) return;

    try {
      const updatedUser = await UserService.updateUser(user._id, editedUser);
      setProfileUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update user data');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!user) return;
    try {
      await UserService.deleteUser(user._id);
      logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account');
    }
    setIsDeleteConfirmOpen(false);
  };

  const handleCancelEdit = () => {
    setEditedUser(profileUser);
    setIsEditing(false);
  };

  if (!profileUser) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <main className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {profileUser.firstName[0]}
            {profileUser.lastName[0]}
          </div>
          <h2 className="page-title">
            {isEditing ? 'Edit Profile' : `${profileUser.firstName} ${profileUser.lastName}`}
          </h2>
        </div>
        <div className="profile-card">
          {isEditing ? (
            <form className="edit-form" onSubmit={handleUpdate}>
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  value={editedUser?.firstName || ''}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  value={editedUser?.lastName || ''}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  value={editedUser?.username || ''}
                  onChange={handleInputChange}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={editedUser?.email || ''}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="info-group">
                <span className="info-label">👤 Username</span>
                <span className="info-value">{profileUser.username}</span>
              </div>
              <div className="info-group">
                <span className="info-label">✉️ Email</span>
                <span className="info-value">{profileUser.email}</span>
              </div>
              <div className="button-group">
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  <span style={{ fontSize: '14px', marginRight: '4px' }}>✏️</span>
                  Edit Profile
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  <span style={{ fontSize: '14px', marginRight: '4px' }}>🗑️</span>
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}
        <ConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          message="Are you sure you want to delete your account? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteConfirmOpen(false)}
        />
      </main>
    </div>
  );
};

export default Profile;