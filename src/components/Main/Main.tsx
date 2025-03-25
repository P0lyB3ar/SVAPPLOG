"use client"

import type React from "react"
import { type ReactNode, useState, useEffect } from "react"
import styled from "styled-components"
import ErrorContainer from "../ErrorContainer/ErrorContainer"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import { Database, RefreshCw } from "lucide-react"
import Result from "./Result"

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

const Main: React.FC<MainProps> = ({ children }) => {
  const [data, setData] = useState<DataItem[]>([])
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [selectedDictionary, setSelectedDictionary] = useState<string>("dynamic")
  const [selectedColumns, setSelectedColumns] = useState<string[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Fetch available dictionaries on mount
  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const response = await fetch("http://localhost:8000/list-dictionaries")
        const result = await response.json()
        const parsedDictionaries = result.dictionaries.map((dict: any) => ({
          name: dict.name,
          columns: dict.data[dict.name] || [],
        }))
        setDictionaries(parsedDictionaries)
      } catch (error) {
        console.error("Error fetching dictionaries:", error)
      }
    }

    fetchDictionaries()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setData([]) // Clear existing data before fetching
    const url = "http://localhost:8000/read?logs=all"

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (response.headers.get("content-type")?.includes("text/html")) {
        const errorHtml = await response.text()
        console.error("Received HTML instead of JSON:", errorHtml)
        alert("Server returned an error. Please check the console.")
        return
      }

      const fetchedData = await response.json()
      console.log("Fetched data:", fetchedData)

      const formattedData = fetchedData.map((item: any) => ({
        ...item,
        timestamp: item.timestamp
          ? new Date(item.timestamp).toLocaleString("en-US", { timeZone: "UTC" })
          : "Invalid Timestamp",
      }))

      setData(formattedData)
    } catch (error) {
      console.error("Error fetching data:", error)
      alert("An error occurred while fetching data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleDictionaryChange = (event: any) => {
    const selectedName = event.target.value
    setSelectedDictionary(selectedName)
    setData([]) // Clear data when switching dictionaries

    if (selectedName === "dynamic") {
      setSelectedColumns(null) // Clear columns for dynamic mode
    } else {
      const selectedDict = dictionaries.find((dict) => dict.name === selectedName)
      setSelectedColumns(selectedDict ? selectedDict.columns : [])
    }
  }

  return (
    <StyledMain>
      <Container>
        <Header>
          <Title>
            <Database size={24} />
            Log Explorer
          </Title>

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
              onClick={fetchData}
              disabled={loading}
              startIcon={<RefreshCw size={18} className={loading ? "animate-spin" : ""} />}
            >
              {loading ? "Fetching..." : "Fetch Data"}
            </StyledButton>
          </Controls>
        </Header>

        <ErrorContainer />

        <div style={{ flexGrow: 1, overflow: "hidden", marginTop: "16px" }}>
          <Result rows={data} columns={selectedColumns} loading={loading} />
        </div>

        {children}
      </Container>
    </StyledMain>
  )
}

export default Main

