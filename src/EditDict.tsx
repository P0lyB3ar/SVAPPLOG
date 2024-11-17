import React, { useEffect, useState } from 'react';
import Header from './components/Header/Header';
import DictionaryEdit from './components/Main/DictionaryEdit';
import { useParams } from 'react-router-dom';

const EditDict = () => {
  // Get dictionary name from URL parameters
  const { name } = useParams<{ name: string }>();

  // State to store actions fetched from the server
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dictionary data when the component mounts or name changes
  useEffect(() => {
    // Early exit if name is undefined or invalid
    if (!name) {
      setError('Invalid dictionary name');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);  // Reset error on new request

    // Make API call to fetch dictionary data
    fetch(`http://localhost:8000/dictionary/${name}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Dictionary not found');
        }
        return response.json();  // Parse the response as JSON
      })
      .then((data) => {
        // Ensure the actions data exists in the response
        if (data.actions) {
          setActions(data.actions);
        } else {
          setError('No actions found');
        }
      })
      .catch((error) => {
        console.error("Error fetching dictionary:", error);
        setError('Error fetching dictionary data');
      })
      .finally(() => {
        setLoading(false);  // Set loading to false after the request completes
      });

  }, [name]);  // Dependency on `name` to re-fetch data when the URL parameter changes

  // Show loading state while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show error if there was an issue with fetching
  if (error) {
    return <div>{error}</div>;
  }

  // Render the dictionary edit page with fetched data
  return (
    <>
      <Header />
      <DictionaryEdit 
        dictionaryName={name}  // Pass dynamic dictionary name
        actions={actions}      // Pass the fetched actions
      />
    </>
  );
};

export default EditDict;
