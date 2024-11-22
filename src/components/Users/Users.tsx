import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { DataGrid } from "@mui/x-data-grid";
import { SxProps } from "@mui/system";

const StyledMain = styled.div`
  background: #010409;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  margin-top: 250px;
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

interface UserItem {
  user_id: number;
  username: string;
  role: string;
  created_on: string;
}

// Utility function to handle API requests
const fetchData = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}), // Add Authorization header if token exists
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "An error occurred");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error with request to ${url}:`, error);
    throw error;
  }
};

const UserDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<{ [key: number]: string }>({}); // Store selected roles

  // Define the updateRole function
  const updateRole = async (userId: number) => {
    const url = `http://localhost:8000/update-role`;
    const role = roles[userId]; // Get the selected role for the user
    const body = { user_id: userId, role };
  
    try {
      await fetchData(url, {
        method: "POST",
        body: JSON.stringify(body),
      });
      alert("Role updated successfully!");
      fetchUsers(); // Refresh the table with updated data
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        console.error("Unknown error occurred:", error);
        alert("An unexpected error occurred.");
      }
    }
  };
  
  // Fetch users
  const fetchUsers = async () => {
    const url = `http://localhost:8000/user-dashboard`;
    try {
      const data = await fetchData(url, { method: "GET" });
      setUsers(data.users);
      const initialRoles = Object.fromEntries(data.users.map((user: UserItem) => [user.user_id, user.role]));
      setRoles(initialRoles); // Initialize roles state
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error fetching users: ${error.message}`);
      } else {
        console.error("Unknown error occurred:", error);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { field: "user_id", headerName: "User ID", width: 150 },
    { field: "username", headerName: "Username", width: 330 },
    {
      field: "role",
      headerName: "Role",
      width: 330,
      renderCell: (params: any) => (
        <Select
          value={roles[params.row.user_id] || ""}
          onChange={(e) =>
            setRoles((prev) => ({ ...prev, [params.row.user_id]: e.target.value }))
          }
          style={{ color: "white", backgroundColor: "#0d1117", width: "100%" }}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="owner">Owner</MenuItem>
        </Select>
      ),
    },
    {
      field: "created_on",
      headerName: "Created On",
      width: 330,
      valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params: any) => (
        <Button
          variant="contained"
          onClick={() => updateRole(params.row.user_id)}
          style={{ padding: "5px 10px" }}
        >
          Update
        </Button>
      ),
    },
  ];

  const sx: SxProps = {
    '& .MuiDataGrid-root': {
      fontSize: '16px',
      height: '100%',
    },
    '& .MuiIconButton-root': {
      color: '#fff',
    },
    '& .MuiDataGrid-iconSeparator': {
      color: '#fff',
    },
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: '#0D1117',
      color: '#fff',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 'bold',
      fontSize: '16px',
    },
    '& .MuiDataGrid-cell': {
      color: 'white',
      borderBottom: '1px solid #30363d',
      backgroundColor: '#0d1117',
    },
    '& .MuiDataGrid-footerContainer': {
      backgroundColor: '#151b23',
    },
    '& .MuiDataGrid-toolbar': {
      backgroundColor: '#e9ecef',
    },
    '& .MuiDataGrid-row': {
      backgroundColor: '#C6F2F4',
    },
    '& .MuiDataGrid-row.Mui-selected': {
      backgroundColor: '#ffffff !important',
      color: '#0d1117 !important',
    },
    '& .MuiDataGrid-row.Mui-selected:hover': {
      backgroundColor: '#f0f0f0 !important',
    },
    '& .MuiCheckbox-root.Mui-checked': {
      color: '#ffffff !important',
    },
    '& .MuiDataGrid-scrollbarFiller': {
      background: '#0D1117',
    },
    '& .MuiDataGrid-filler':{
      backgroundColor: '#0D1117',
    },
    '& .MuiDataGrid-overlay': {
      color: 'white',
      background: '#0D1117',
    },
    '& .MuiToolbar-root':{
      color:'white',
    },
    '& .MuiTablePagination-toolbar': {
      color: 'white',
    },
  };

  return (
    <StyledMain>
      <Container>
        <h1 style={{ color: "#ffffff", fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif" }}>User Dashboard</h1>
        <div style={{ height: "560px", width: "100%" }}>
          <DataGrid
            sx={sx}
            rows={users.map((user) => ({
              id: user.user_id,
              user_id: user.user_id,
              username: user.username,
              role: user.role,
              created_on: user.created_on,
              actions: "", // Empty string for actions column to trigger renderCell
            }))}
            columns={columns}
            pageSize={5}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </div>
      </Container>
    </StyledMain>
  );
};

export default UserDashboard;
