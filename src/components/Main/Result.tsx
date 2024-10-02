import { DataGrid } from '@mui/x-data-grid';
import { SxProps } from '@mui/system';
import React, { useState, useEffect } from 'react';

function Result() {
    const [rows, setRows] = useState([]);

    const columns = [
        { field: 'id', headerName: 'User_ID', width: 150 },
        { field: 'user', headerName: 'User', width: 380 },
        { field: 'type', headerName: 'Action', width: 380 },
        { field: 'timestamp', headerName: 'Time Stamp', width: 380 },
        { field: 'path', headerName: 'Path', width: 380 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const url = "http://localhost:8000/read?logs=all&dict=1&sort=";

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': '*/*',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const transformedRows = data.map((item: any, index: number) => ({
                    id: item.id || index + 1, 
                    user: item.data?.user || 'None',
                    type: item.type || 'N/A',
                    timestamp: new Date(item.timestamp).toLocaleString() || 'N/A',
                    path: item.path || 'None',
                }));

                setRows(transformedRows);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        fetchData();
    }, []);

    const sx: SxProps = {
        '& .MuiDataGrid-root': {
            fontSize: '16px',
            height: '100%'
        },
        '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#5DBDD3',
            color: '#333',
        },
        '& .MuiDataGrid-filler': {
            backgroundColor: 'rgb(223, 245, 247)',
            color: '#333'
        },
        '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
            fontSize: '16px'
        },
        '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #ddd',
        },
        '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#ebfdff',
        },
        '& .MuiDataGrid-checkbox': {
            color: '#007bff',
        },
        '& .MuiDataGrid-toolbar': {
            backgroundColor: '#e9ecef',
        },
        '& .MuiDataGrid-overlay': {
            backgroundColor: '#7EC8E3',
        },
        '& .MuiDataGrid-row': {
            backgroundColor: '#C6F2F4',
        },
    };

    return (
        <div id="result" style={{ height: 680, width: '100%' }}>
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
}

export default Result;
