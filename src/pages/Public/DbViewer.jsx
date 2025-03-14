import React, { useEffect, useState } from 'react';
import { getRequest } from '../../services/apis/requests';

const DatabaseSchemaViewer = ({ data }) => {
  const [selectedTable, setSelectedTable] = useState(data[0]?.name);

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'left'
  };

  const cellStyle = {
    border: '1px solid #ddd',
    padding: '10px',
    fontSize: '14px'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  };

  const buttonStyle = (table) => ({
    padding: '10px 15px',
    backgroundColor: selectedTable === table ? '#007bff' : '#f4f4f4',
    color: selectedTable === table ? 'white' : 'black',
    border: '1px solid #ddd',
    cursor: 'pointer',
    borderRadius: '4px'
  });

  // Find the currently selected table's columns
  const currentTableColumns = data.find(table => table.name === selectedTable)?.cloumns || [];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Database Schema Viewer</h1>
      
      <div style={buttonContainerStyle}>
        {data.map(table => (
          <button 
            key={table.name}
            style={buttonStyle(table.name)}
            onClick={() => setSelectedTable(table.name)}
          >
            {table.name}
          </button>
        ))}
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerStyle}>Column Name</th>
            <th style={headerStyle}>Table Qualifier</th>
            <th style={headerStyle}>Data Type</th>
            <th style={headerStyle}>Nullable</th>
            <th style={headerStyle}>Precision</th>
            <th style={headerStyle}>Length</th>
          </tr>
        </thead>
        <tbody>
          {currentTableColumns.map((column, index) => (
            <tr key={index}>
              <td style={cellStyle}>{column.COLUMN_NAME}</td>
              <td style={cellStyle}>{column.TABLE_QUALIFIER}</td>
              <td style={cellStyle}>{column.TYPE_NAME}</td>
              <td style={cellStyle}>{column.IS_NULLABLE}</td>
              <td style={cellStyle}>{column.PRECISION}</td>
              <td style={cellStyle}>{column.LENGTH}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const DbViewer=()=>{
    const [data,setData] = useState([])

    const getData = async ()=>{
        const response = await getRequest("dbtable-cols/")
        setData(response.data)
    }

    useEffect(()=>{
        getData()
    },[])

    return(
        <DatabaseSchemaViewer data={data}/>
    )
}

export default DbViewer;