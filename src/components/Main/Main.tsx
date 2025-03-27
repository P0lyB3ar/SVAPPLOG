"use client"

import type React from "react"
import { type ReactNode, useState, useEffect } from "react"
import styled from "styled-components"
import ErrorContainer from "../ErrorContainer/ErrorContainer"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import { Database, RefreshCw, ArrowLeft } from "lucide-react"
import Result from "./Result"
import ApplicationSelector from "./application-selector"

const StyledMain = styled.div`
  background: #010409;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Container = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  background: #151b23;
  padding: 24px;
  max-width: 1850px;
  box-sizing: border-box;
  width: 95%;
  border-radius: 12px;
  max-height: 95vh;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const Title = styled.h1`
  color: #ffffff;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`

const StyledSelect = styled(Select)`
  & .MuiSelect-select {
    padding: 10px 14px;
    min-width: 200px;
  }
  
  & .MuiOutlinedInput-notchedOutline {
    border-color: #30363d;
  }
  
  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: #58a6ff;
  }
  
  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #58a6ff;
  }
`

const StyledButton = styled(Button)`
  background-color: #238636 !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 8px 16px !important;
  
  &:hover {
    background-color: #2ea043 !important;
  }
`

const BackButton = styled(Button)`
  background-color: transparent !important;
  color: #58a6ff !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 8px 16px !important;
  border: 1px solid #30363d !important;
  margin-right: auto !important;
  
  &:hover {
    background-color: rgba(88, 166, 255, 0.1) !important;
  }
`

interface MainProps {
  children?: ReactNode
}

interface DataItem {
  id: number
  [key: string]: any
}

interface Dictionary {
  name: string
  columns: string[]
}

interface Application {
  application_id: number
  name: string
  secret: string
  organisation: string
  user_id: number
}

const Main: React.FC<MainProps> = ({ children }) => {
  const [data, setData] = useState<DataItem[]>([])
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedDictionary, setSelectedDictionary] = useState<string>("dynamic")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<"select" | "logs">("select")

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch dictionaries
        const dictResponse = await fetch("http://localhost:8000/list-dictionaries")
        const dictResult = await dictResponse.json()
        const parsedDictionaries = dictResult.dictionaries.map((dict: any) => ({
          name: dict.name,
          columns: dict.data[dict.name] || [],
        }))
        setDictionaries(parsedDictionaries)

        // Fetch applications
        const appResponse = await fetch("http://localhost:8000/list-applications", {
          credentials: "include",
        })
        const appResult = await appResponse.json()
        console.log("Applications API response:", appResult)

        const parsedApplications = (appResult.applications || []).map((app: any) => ({
          application_id: app.application_id,
          name: app.name,
          secret: app.secret,
          organisation: app.organisation || '',
          user_id: app.user_id
        }))

        console.log("Parsed applications:", parsedApplications)
        setApplications(parsedApplications)
      } catch (error) {
        console.error("Error fetching initial data:", error)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch data when application is selected
  useEffect(() => {
    if (viewMode === "logs" && selectedApplication) {
      fetchData()
    }
  }, [selectedApplication, viewMode])

  const fetchData = async () => {
    if (!selectedApplication?.secret) {
      console.error("No application secret available")
      return
    }

    setLoading(true)
    setData([])

    try {
      console.log("Fetching data with secret:", selectedApplication.secret)
      const response = await fetch("http://localhost:8000/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          applicationSecret: selectedApplication.secret,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        throw new Error(`Invalid content type. Received: ${contentType}. Body: ${text}`)
      }

      const fetchedData = await response.json()
      console.log("Fetched data:", fetchedData)

      const formattedData = fetchedData.map((item: any, index: number) => ({
        ...item,
        id: index + 1,
        timestamp: item.timestamp
          ? new Date(item.timestamp).toLocaleString("en-US", { timeZone: "UTC" })
          : "Invalid Timestamp",
      }))

      setData(formattedData)
    } catch (error) {
      console.error("Error fetching data:", error)
      alert(`Error fetching data: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDictionaryChange = (event: any) => {
    const selectedName = event.target.value
    setSelectedDictionary(selectedName)
    setData([])

    if (selectedName === "dynamic") {
      setSelectedColumns(null)
    } else {
      const selectedDict = dictionaries.find((dict) => dict.name === selectedName)
      setSelectedColumns(selectedDict ? selectedDict.columns : [])
    }
  }

  const handleApplicationSelect = (application: Application) => {
    console.log("Handling application selection:", application)
    if (!application?.secret) {
      console.error("Application secret is missing")
      alert("Selected application is invalid - missing secret")
      return
    }
    setSelectedApplication(application)
    setViewMode("logs")
  }

  const handleBackToSelector = () => {
    setViewMode("select")
    setSelectedApplication(null)
  }

  const handleRefresh = () => {
    if (selectedApplication) {
      fetchData()
    }
  }

  return (
    <StyledMain>
      <Container>
        {viewMode === "select" ? (
          <ApplicationSelector 
            applications={applications} 
            onSelectApplication={handleApplicationSelect} 
          />
        ) : (
          <>
            <Header>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <BackButton onClick={handleBackToSelector} startIcon={<ArrowLeft size={18} />}>
                  Back
                </BackButton>
                <Title>
                  <Database size={24} />
                  Log Explorer: {selectedApplication?.name || "No Application Selected"}
                </Title>
              </div>

              <Controls>
                <StyledSelect
                  value={selectedDictionary}
                  onChange={handleDictionaryChange}
                  displayEmpty
                  sx={{
                    color: "white",
                    backgroundColor: "#0D1117",
                    "& .MuiSvgIcon-root": {
                      color: "white",
                    },
                  }}
                >
                  <MenuItem value="dynamic">Dynamic (Auto-Detect)</MenuItem>
                  {dictionaries.map((dict) => (
                    <MenuItem key={dict.name} value={dict.name}>
                      {dict.name}
                    </MenuItem>
                  ))}
                </StyledSelect>

                <StyledButton
                  variant="contained"
                  onClick={handleRefresh}
                  disabled={loading || !selectedApplication}
                  startIcon={<RefreshCw size={18} className={loading ? "animate-spin" : ""} />}
                >
                  {loading ? "Refreshing..." : "Refresh Data"}
                </StyledButton>
              </Controls>
            </Header>

            <ErrorContainer />

            <div style={{ flexGrow: 1, overflow: "hidden", marginTop: "16px" }}>
              <Result 
                rows={data} 
                columns={selectedColumns} 
                loading={loading} 
              />
            </div>
          </>
        )}

        {children}
      </Container>
    </StyledMain>
  )
}

export default Main