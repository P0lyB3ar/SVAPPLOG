import { DataGrid } from '@mui/x-data-grid';
import { SxProps } from '@mui/system';
import React from 'react';

interface ResultProps {
  rows: any[]; // The rows are passed from the parent component (Main)
}

const Result: React.FC<ResultProps> = ({ rows }) => {
  const columns = [
    { field: 'id', headerName: 'User_ID', width: 150 },
    { field: 'user', headerName: 'User', width: 380 },
    { field: 'type', headerName: 'Action', width: 380 },
    { field: 'timestamp', headerName: 'Time Stamp', width: 380 },
    { field: 'path', headerName: 'Path', width: 380 },
  ];

  const sx: SxProps = {
    '& .MuiDataGrid-root': {
      fontSize: '16px',
      height: '100%',
    },
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: '#5DBDD3',
      color: '#333',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 'bold',
      fontSize: '16px',
    },
    '& .MuiDataGrid-cell': {
      borderBottom: '1px solid #ddd',
    },
    '& .MuiDataGrid-footerContainer': {
      backgroundColor: '#ebfdff',
    },
    '& .MuiDataGrid-toolbar': {
      backgroundColor: '#e9ecef',
    },
    '& .MuiDataGrid-row': {
      backgroundColor: '#C6F2F4',
    },
  };

  return (
    <div style={{ height: 680, width: '100%' }}>
      <DataGrid
        sx={sx}
        rows={rows}
        columns={columns}
        pagination
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
      />
    </div>
  );
};

export default Result;
