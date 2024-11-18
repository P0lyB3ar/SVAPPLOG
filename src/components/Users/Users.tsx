import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from '@mui/material/Button';
import { responsiveFontSizes } from "@mui/material";

const StyledMain = styled.div`
  background: #010409;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  margin-top: 160px;
  margin-bottom: 95px;
  background: #151b23;
  padding: 20px;
  max-width: 1850px;
  box-sizing: border-box;
  width: 100%;
  border-radius: 10px;
  height: 50rem;
  overflow: hidden;
`;

const LoadingScreen = styled.div`
  color: white;
  font-size: 4rem;
  font-style: sans-serif;
  font-weight: bold;
`;

interface UserItem {
  user_id: number;
  username: string;
  role: string;
  created_on: string;
}

const UserDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Verify user role
  const verifyUserRole = async () => {
    const url = `https://svapplog.onrender.com/verify-role`; // Replace with actual URL
    try {
      const token = sessionStorage.getItem("jwtToken");
      if (!token) {
        alert('You need to log in first!');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.role === "admin" || data.role === "owner") {
          setIsAuthorized(true);
        } else {
          alert('Unauthorized access!');
          window.location.href = '/unauthorized';
        }
      } else {
        alert('Failed to verify role.');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error("Error verifying role:", error);
      alert("Error verifying role.");
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users for dashboard
  const fetchUsers = async () => {
    const url = `https://svapplog.onrender.com/user-dashboard`;
    try {
      const token = sessionStorage.getItem("jwtToken");
      if (!token) {
        alert('You need to log in first!');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUsers(data.users); // Assuming response is in the format { users: [...] }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Error fetching users.");
    }
  };

  // Update user role
  const updateRole = async (userId: number, role: string) => {
    const url = `https://svapplog.onrender.com/update-role`;
    const body = { user_id: userId, role };

    try {
      const token = sessionStorage.getItem("jwtToken");
      if (!token) {
        alert('You need to log in first!');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert("Role updated successfully!");
        fetchUsers(); // Refresh users after role update
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to update role'}`);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error updating role.");
    }
  };

  useEffect(() => {
    verifyUserRole();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized]);

  if (isLoading) {
    return (
      <StyledMain>
        <LoadingScreen >Loading...</LoadingScreen>
      </StyledMain>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <StyledMain>
      <Container>
        <h1>User Dashboard</h1>
        {users.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.username}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.user_id, e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                      <option value="user">User</option>
                    </select>
                  </td>
                  <td>{new Date(user.created_on).toLocaleString()}</td>
                  <td>
                    <Button
                      variant="contained"
                      onClick={() => updateRole(user.user_id, user.role)}
                      style={{ padding: '5px 10px', marginLeft: '10px' }}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </Container>
    </StyledMain>
  );
};

export default UserDashboard;
