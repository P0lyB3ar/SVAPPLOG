import { DataGrid } from '@mui/x-data-grid';
import { SxProps } from '@mui/system';
import React, { useState } from 'react';

interface ResultProps {
  rows: any[]; // The rows are passed from the parent component (Main)
}

const Result: React.FC<ResultProps> = ({ rows }) => {
  // Local state to manage loading status
  const [isLoading, setIsLoading] = useState(false);

  const columns = [
    { field: 'id', headerName: 'User_ID', width: 150 },
    { field: 'user', headerName: 'User', width: 330 },
    { field: 'type', headerName: 'Action', width: 330 },
    { field: 'timestamp', headerName: 'Time Stamp', width: 330 },
    { field: 'path', headerName: 'Path', width: 304 },
  ];

  // Process the rows to flatten nested "data.user"
  const processedRows = rows.map(row => {
    console.log("Raw timestamp:", row.timestamp);
    return {
      id: row.id,
      user: row.data?.user || 'N/A', // Extract user from data or default to 'N/A'
      type: row.type,
      timestamp: row.timestamp
        ? (() => {
            const date = new Date(row.timestamp);
            return isNaN(date.getTime())
              ? 'Invalid Timestamp'
              : date.toLocaleString('en-US', { timeZone: 'UTC' }); // Format timestamp
          })()
        : 'Timestamp Missing', // Handle missing timestamps
      path: row.path || 'N/A', // Default to 'N/A' if path is null
    };
  });

  const sx: SxProps = {
    '& .MuiDataGrid-root': {
      fontSize: '16px',
      height: '50%',
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
    '& .MuiDataGrid-scrollbar':{
      overflowX: "hidden",
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
    '& .MuiDataGrid-overlay':{
      color:'white',
      background:'#0D1117',

    },
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <DataGrid
        sx={sx}
        rows={processedRows}
        columns={columns}
        hideFooterPagination={isLoading}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        loading={isLoading}
        disableRowSelectionOnClick={false}
      />
    </div>
  );
};

export default Result;
