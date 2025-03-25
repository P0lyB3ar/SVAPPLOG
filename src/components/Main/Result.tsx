"use client"

import { DataGrid, type GridColDef, GridLoadingOverlay } from "@mui/x-data-grid"
import type { SxProps } from "@mui/system"
import type React from "react"
import { useMemo } from "react"
import styled from "styled-components"
import { Info } from "lucide-react"

const ResultContainer = styled.div`
  height: calc(100% - 16px);
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #30363d;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8b949e;
  padding: 32px;
  text-align: center;
`

interface ResultProps {
  rows: any[]
  columns: string[] | null
  loading?: boolean
}

const Result: React.FC<ResultProps> = ({ rows, columns, loading = false }) => {
  // Process rows to flatten the structure (spread `log` inside each row)
  const processedRows = useMemo(
    () =>
      rows.map((row, index) => ({
        id: row.log_id ?? `row-${index}`,
        log_id: row.log_id,
        ...row.log,
      })),
    [rows],
  )

  // Dynamically generate columns
  const gridColumns = useMemo(() => {
    const baseColumns: GridColDef[] = [
      {
        field: "log_id",
        headerName: "Log ID",
        width: 100,
        headerAlign: "left",
        align: "left",
      },
    ]

    if (columns && columns.length > 0) {
      // Generate columns based on dictionary
      const additionalColumns = columns
        .filter((col) => col !== "log_id") // Prevent duplicates
        .map((col) => ({
          field: col,
          headerName: col.charAt(0).toUpperCase() + col.slice(1),
          width: 200,
          flex: 1,
          headerAlign: "left" as const,
          align: "left" as const,
        }))
      return [...baseColumns, ...additionalColumns]
    }

    // Dynamic mode - derive from first row if available
    if (processedRows.length > 0) {
      const firstRow = processedRows[0]
      const dynamicColumns = Object.keys(firstRow)
        .filter((key) => key !== "id" && key !== "log_id") // Exclude system fields
        .map((key) => ({
          field: key,
          headerName: key.charAt(0).toUpperCase() + key.slice(1),
          width: 200,
          flex: 1,
          headerAlign: "left" as const,
          align: "left" as const,
        }))
      return [...baseColumns, ...dynamicColumns]
    }

    return baseColumns
  }, [columns, processedRows])

  // Styles for DataGrid
  const sx: SxProps = {
    border: "none",
    "& .MuiDataGrid-root": {
      fontSize: "14px",
      height: "100%",
      borderRadius: "8px",
    },
    "& .MuiIconButton-root, & .MuiSvgIcon-root": {
      color: "#8b949e",
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: "#0D1117",
      color: "#fff",
      padding: "0 16px",
      height: "48px",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: "600",
      fontSize: "14px",
    },
    "& .MuiDataGrid-columnSeparator": {
      display: "none",
    },
    "& .MuiDataGrid-cell": {
      color: "#c9d1d9",
      borderBottom: "1px solid #21262d",
      backgroundColor: "#0d1117",
      padding: "0 16px",
      fontSize: "14px",
    },
    "& .MuiDataGrid-row": {
      "&:hover": {
        backgroundColor: "#161b22",
      },
      "&.Mui-selected": {
        backgroundColor: "#1f6feb33",
        "&:hover": {
          backgroundColor: "#1f6feb44",
        },
      },
    },
    "& .MuiDataGrid-footerContainer": {
      backgroundColor: "#0D1117",
      borderTop: "1px solid #30363d",
    },
    "& .MuiTablePagination-root": {
      color: "#c9d1d9",
    },
    "& .MuiTablePagination-selectIcon": {
      color: "#8b949e",
    },
    "& .MuiDataGrid-virtualScroller": {
      backgroundColor: "#0d1117",
    },
    "& .MuiDataGrid-overlay": {
      backgroundColor: "#0d1117",
      color: "#8b949e",
    },
  }

  return (
    <ResultContainer>
      {rows.length === 0 && !loading ? (
        <EmptyState>
          <Info size={48} style={{ marginBottom: "16px", opacity: 0.6 }} />
          <h3 style={{ margin: "0 0 8px 0", color: "#c9d1d9" }}>No data to display</h3>
          <p style={{ margin: 0 }}>Select a dictionary and click "Fetch Data" to load information</p>
        </EmptyState>
      ) : (
        <DataGrid
          sx={sx}
          rows={processedRows}
          columns={gridColumns}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          disableRowSelectionOnClick={true}
          loading={loading}
          components={{
            LoadingOverlay: GridLoadingOverlay,
          }}
        />
      )}
    </ResultContainer>
  )
}

export default Result

