import React, { useEffect, useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart,
  Line
} from 'recharts'
import { getRequest } from '../../../../services/apis/requests'

const DailySalesChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getData = async () => {
    try {
      const response = await getRequest("reports/daile-sales-summery/")
      // Transform data for charting
      const transformedData = response.data.map(item => ({
        code: item.Code,
        totalBillAmount: parseFloat(item.TotalBillAmount || 0),
        cash: parseFloat(item.Cash || 0),
        digitalBank: parseFloat(item['Digitel/Bank'] || 0)
      }))
      setData(transformedData)
      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  // Compute total statistics
  const totalStats = {
    totalSales: data.reduce((sum, item) => sum + item.totalBillAmount, 0),
    totalCash: data.reduce((sum, item) => sum + item.cash, 0),
    totalDigitalBank: data.reduce((sum, item) => sum + item.digitalBank, 0)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>

  return (
    <div style={{ width: '100%', height: 800, padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Daily Sales Visualization</h2>
      
      {/* Stacked Bar Chart */}
      <div style={{ width: '100%', height: '250px' }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value.toFixed(2)}`, 
                name === 'totalBillAmount' ? 'Total Bill' : 
                name === 'cash' ? 'Cash' : 'Digital/Bank'
              ]}
            />
            <Legend />
            <Bar dataKey="totalBillAmount" stackId="a" fill="#8884d8" name="Total Bill" />
            <Bar dataKey="cash" stackId="a" fill="#82ca9d" name="Cash" />
            <Bar dataKey="digitalBank" stackId="a" fill="#ffc658" name="Digital/Bank" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Composed Chart with Line and Bar */}
      <div style={{ width: '100%', height: '250px', marginTop: '40px' }}>
        <ResponsiveContainer>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value.toFixed(2)}`, 
                name === 'totalBillAmount' ? 'Total Bill' : 
                name === 'cash' ? 'Cash' : 'Digital/Bank'
              ]}
            />
            <Legend />
            <Bar dataKey="totalBillAmount" barSize={20} fill="#8884d8" name="Total Bill" />
            <Line 
              type="monotone" 
              dataKey="cash" 
              stroke="#82ca9d" 
              name="Cash Trend" 
            />
            <Line 
              type="monotone" 
              dataKey="digitalBank" 
              stroke="#ffc658" 
              name="Digital/Bank Trend" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#f4f4f4',
        borderRadius: '10px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Total Sales</h3>
          <p style={{ fontWeight: 'bold', color: '#8884d8' }}>
            {totalStats.totalSales.toFixed(2)}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3>Total Cash</h3>
          <p style={{ fontWeight: 'bold', color: '#82ca9d' }}>
            {totalStats.totalCash.toFixed(2)}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3>Total Digital/Bank</h3>
          <p style={{ fontWeight: 'bold', color: '#ffc658' }}>
            {totalStats.totalDigitalBank.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DailySalesChart