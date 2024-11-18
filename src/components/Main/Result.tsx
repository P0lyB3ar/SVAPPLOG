import { DataGrid } from '@mui/x-data-grid';
import { SxProps } from '@mui/system';
import React from 'react';

interface ResultProps {
  rows: any[]; // The rows are passed from the parent component (Main)
}

const Result: React.FC<ResultProps> = ({ rows }) => {
  const columns = [
    { field: 'id', headerName: 'User_ID', width: 150 },
    { field: 'user', headerName: 'User', width: 250 },
    { field: 'name', headerName: 'Name', width: 320 },
    { field: 'type', headerName: 'Action', width: 380 },
    { field: 'timestamp', headerName: 'Time Stamp', width: 380 },
    { field: 'path', headerName: 'Path', width: 277 },
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
    '& .MuiDataGrid-overlay': {
      backgroundColor: '#151b23',
    },
    '& .MuiSvgIcon-root': {
      color: '#fff',
    },
    '& .MuiTablePagination-displayedRows': {
      color: '#fff',
    },
    '& .MuiDataGrid-filler': {
      backgroundColor: '#0D1117',
    },
    '& .MuiDataGrid-cell': {
      borderBottom: '1px solid #ddd',
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
    // Styling for selected rows
    '& .MuiDataGrid-row.Mui-selected': {
      backgroundColor: '#ffffff !important', // Turns the row white when clicked
      color: '#0d1117 !important', // Ensures text remains visible
    },
    '& .MuiDataGrid-row.Mui-selected:hover': {
      backgroundColor: '#f0f0f0 !important', // Slightly lighter shade on hover
    },
    // Checkbox styling for selected rows
    '& .MuiCheckbox-root.Mui-checked': {
      color: '#ffffff !important', // White checkbox color
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
        disableRowSelectionOnClick={false} // Keeps row selection functionality
      />
    </div>
  );
};

export default Result;
