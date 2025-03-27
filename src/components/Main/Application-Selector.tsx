"use client"

import type React from "react"
import styled from "styled-components"

const SelectorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  margin-top: 20px;
`

const ApplicationBox = styled.div`
  border: 2px solid #30363d;
  background-color: #0D1117;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #58a6ff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #238636, #2ea043);
  }
`

const ApplicationName = styled.span`
  color: white;
  font-weight: 500;
  font-size: 18px;
  text-align: center;
  padding: 16px;
`

const OrganisationName = styled.span`
  color: #8b949e;
  font-size: 14px;
  text-align: center;
`

const SelectorTitle = styled.h2`
  color: white;
  font-size: 24px;
  margin-bottom: 20px;
`

interface Application {
  application_id: number
  name: string
  secret: string
  organisation: string
  user_id: number
}

interface ApplicationSelectorProps {
  applications: Application[]
  onSelectApplication: (application: Application) => void
}

const ApplicationSelector: React.FC<ApplicationSelectorProps> = ({ 
  applications, 
  onSelectApplication 
}) => {
  if (applications.length === 0) {
    return (
      <div>
        <SelectorTitle>Select Application</SelectorTitle>
        <div style={{ color: "white", textAlign: "center", padding: "40px 0" }}>
          No applications available. Please add an application first.
        </div>
      </div>
    )
  }

  return (
    <div>
      <SelectorTitle>Select Application</SelectorTitle>
      <SelectorContainer>
        {applications.map((app) => (
          <ApplicationBox 
            key={app.application_id} 
            onClick={() => {
              console.log("Selected application:", app)
              onSelectApplication(app)
            }}
          >
            <ApplicationName>{app.name}</ApplicationName>
            {app.organisation && <OrganisationName>{app.organisation}</OrganisationName>}
          </ApplicationBox>
        ))}
      </SelectorContainer>
    </div>
  )
}

export default ApplicationSelector