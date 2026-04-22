import React, { useState, useEffect, useCallback } from 'react'
import { 
  MagnifyingGlassIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUturnLeftIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { API_BASE_URL } from '@config/api.js'

const ContactMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ new: 0, read: 0, replied: 0 })

  const fetchMessages = useCallback(async (page = 1, filters = {}) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...filters
      })
      
      const token = localStorage.getItem('kk_admin_token')
      console.log('Debug - Token exists:', !!token)
      console.log('Debug - Token value:', token ? `${token.substring(0, 20)}...` : 'null')
      console.log('Debug - API URL:', `${API_BASE_URL}/contact?${params}`)
      
      if (!token || token === 'null' || token === 'undefined') {
        setError('Authentication required. Please log in to access admin panel.')
        setLoading(false)
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/contact?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Debug - Response status:', response.status)
      console.log('Debug - Response headers:', response.headers.get('content-type'))
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch messages`)
      }
      
      const data = await response.json()
      console.log('Debug - Response data:', data)
      
      setMessages(data.data?.messages || [])
      setTotalPages(data.data?.pagination?.totalPages || 1)
      setStats(data.data?.stats || { new: 0, read: 0, replied: 0 })
    } catch (err) {
      console.error('Debug - Fetch error:', err)
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      })
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages(currentPage, { search, status: statusFilter })
  }, [currentPage, search, statusFilter, fetchMessages])

  const handleMessageStatusUpdate = async (messageId, newStatus, adminNotes = '') => {
    try {
      const token = localStorage.getItem('kk_admin_token')
      const response = await fetch(`${API_BASE_URL}/contact/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, adminNotes })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update status')
      }
      
      // Refresh messages
      fetchMessages(currentPage, { search, status: statusFilter })
      
      // Update selected message if open
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({
          ...selectedMessage,
          status: newStatus,
          adminNotes
        })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return
    }
    
    try {
      const token = localStorage.getItem('kk_admin_token')
      const response = await fetch(`${API_BASE_URL}/contact/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete message')
      }
      
      // Refresh messages
      fetchMessages(currentPage, { search, status: statusFilter })
      
      // Close detail view if deleted message was selected
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-yellow-100 text-yellow-800'
      case 'replied': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <ClockIcon className="h-4 w-4" />
      case 'read': return <CheckCircleIcon className="h-4 w-4" />
      case 'replied': return <ArrowUturnLeftIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        
        {/* Stats */}
        <div className="flex space-x-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-blue-800 font-medium">New: {stats.new}</span>
          </div>
          <div className="bg-yellow-50 px-4 py-2 rounded-lg">
            <span className="text-yellow-800 font-medium">Read: {stats.read}</span>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-green-800 font-medium">Replied: {stats.replied}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2 space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-500">
                {search || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No contact messages yet'
                }
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                onClick={() => setSelectedMessage(message)}
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                  selectedMessage?._id === message._id ? 'ring-2 ring-[#ae0b0b]' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <h3 className="font-medium text-gray-900">{message.fullName}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {getStatusIcon(message.status)}
                        <span className="ml-1">{message.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{message.subject}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{message.message}</p>
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    {new Date(message.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Message Details</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{selectedMessage.fullName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedMessage.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedMessage.phone}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Subject:</span>
                    <p className="text-sm text-gray-600">{selectedMessage.subject}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Message:</span>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Date:</span>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedMessage.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                      {getStatusIcon(selectedMessage.status)}
                      <span className="ml-1">{selectedMessage.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                  <textarea
                    value={selectedMessage.adminNotes ?? ""}
                    onChange={(e) => setSelectedMessage({...selectedMessage, adminNotes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]"
                    rows={3}
                    placeholder="Add notes about this message..."
                  />
                </div>
                
                <div className="flex space-x-2">
                  {selectedMessage.status !== 'read' && (
                    <button
                      onClick={() => handleMessageStatusUpdate(selectedMessage._id, 'read', selectedMessage.adminNotes)}
                      className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  
                  {selectedMessage.status !== 'replied' && (
                    <button
                      onClick={() => handleMessageStatusUpdate(selectedMessage._id, 'replied', selectedMessage.adminNotes)}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Mark as Replied
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a message</h3>
              <p className="text-gray-500">Choose a message from the list to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ContactMessages
