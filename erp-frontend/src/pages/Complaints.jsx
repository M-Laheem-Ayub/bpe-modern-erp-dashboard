import React, { useState, useEffect } from 'react';
import api from '../api';
import { LifeBuoy, Plus, Search, Download, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [formData, setFormData] = useState({
        customerName: '',
        issueType: '',
        description: '',
        priority: 'Medium',
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Edit State
    const [editingId, setEditingId] = useState(null);

    // Bulk Delete State
    const [selectedIds, setSelectedIds] = useState([]);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: null, // 'single' or 'bulk'
        id: null,
        count: 0
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/complaints');
            setComplaints(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(c =>
        (priorityFilter === 'All' || c.priority === priorityFilter) &&
        (statusFilter === 'All' || c.status === statusFilter) &&
        (c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.issueType.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing complaint
                await api.put(`/complaints/${editingId}`, formData);
                setEditingId(null);
            } else {
                // Create new complaint
                await api.post('/complaints', { ...formData, status: 'Open' });
            }
            setFormData({ customerName: '', issueType: '', description: '', priority: 'Medium' });
            fetchComplaints();
        } catch (error) {
            console.error('Error filing complaint:', error);
            alert('Failed to save complaint.');
        }
    };

    const handleEdit = (complaint) => {
        setFormData({
            customerName: complaint.customerName,
            issueType: complaint.issueType,
            description: complaint.description,
            priority: complaint.priority,
        });
        setEditingId(complaint._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        setDeleteModal({
            isOpen: true,
            type: 'single',
            id: id,
            count: 1
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setDeleteModal({
            isOpen: true,
            type: 'bulk',
            id: null,
            count: selectedIds.length
        });
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteModal.type === 'single') {
                await api.delete(`/complaints/${deleteModal.id}`);
                setSelectedIds(selectedIds.filter(id => id !== deleteModal.id));
            } else {
                await api.post('/complaints/bulk-delete', { ids: selectedIds });
                setSelectedIds([]);
            }
            fetchComplaints();
            setDeleteModal({ isOpen: false, type: null, id: null, count: 0 });
        } catch (error) {
            console.error('Error deleting tickets:', error);
            alert('Failed to delete.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentItems.map(c => c._id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ customerName: '', issueType: '', description: '', priority: 'Medium' });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Complaints Report', 14, 10);

        const tableColumn = ["Customer Name", "Issue Type", "Priority", "Status", "Description"];
        const tableRows = filteredComplaints.map(c => [
            c.customerName,
            c.issueType,
            c.priority,
            c.status,
            c.description
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('complaints_tickets.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Customer Support</h2>
                    <p className="text-gray-500 text-sm">Manage customer tickets and complaints.</p>
                </div>
                {/* Removed Add Ticket button from here as it is handled by the form */}
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Ticket' : 'Log Complaint'}</h3>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="customerName" placeholder="Customer Name" value={formData.customerName} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    <input type="text" name="issueType" placeholder="Issue Type (e.g. Refund)" value={formData.issueType} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    <select name="priority" value={formData.priority} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                    </select>
                    <textarea name="description" placeholder="Issue Description" value={formData.description} onChange={handleChange} className="col-span-1 md:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 h-24" required></textarea>

                    <button type="submit" className={`col-span-1 md:col-span-2 py-3 rounded-xl font-semibold transition-colors text-white ${editingId ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}>
                        {editingId ? 'Update Ticket' : 'Submit Ticket'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full xl:w-auto">
                        <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">Active Tickets</h3>
                        <div className="flex gap-2">

                            <button onClick={exportToPDF} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm whitespace-nowrap">
                                <Download size={16} />
                                Export PDF
                            </button>
                            {selectedIds.length > 0 && (
                                <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors text-sm">
                                    <Trash2 size={16} />
                                    Delete ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 outline-none"
                            >
                                <option value="All">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 outline-none"
                            >
                                <option value="All">All Status</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 w-full md:w-64">
                                <Search size={18} className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent outline-none text-sm text-gray-600 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="py-4 px-6 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={currentItems.length > 0 && currentItems.every(c => selectedIds.includes(c._id))}
                                        className="rounded text-red-600 focus:ring-red-500"
                                    />
                                </th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Customer</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Issue Type</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Priority</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Status</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Description</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="py-6 text-center">Loading...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="7" className="py-6 text-center">No active tickets.</td></tr>
                            ) : (
                                currentItems.map((t) => (
                                    <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(t._id)}
                                                onChange={() => handleSelectOne(t._id)}
                                                className="rounded text-red-600 focus:ring-red-500"
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-800">{t.customerName}</td>
                                        <td className="py-4 px-6">{t.issueType}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${t.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {t.priority}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">{t.status}</span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500 truncate max-w-xs">{t.description}</td>
                                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleEdit(t)} className="text-blue-500 hover:text-blue-700 inline-block"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-700 inline-block"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : currentItems.length === 0 ? (
                        <p className="text-center text-gray-500">No active tickets.</p>
                    ) : (
                        currentItems.map((t) => (
                            <div key={t._id} className="bg-white border boundary-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(t._id)}
                                    onChange={() => handleSelectOne(t._id)}
                                    className="absolute top-4 right-4 rounded text-red-600 focus:ring-red-500"
                                />
                                <div className="flex justify-between items-start pr-8">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{t.customerName}</h4>
                                        <p className="text-xs text-gray-500">{t.issueType}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${t.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {t.priority}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                                    {t.description}
                                </div>
                                <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={() => handleEdit(t)} className="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(t._id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredComplaints.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-6 border-t border-gray-100">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-red-600'}`}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:text-red-600'}`}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>


            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title={deleteModal.type === 'bulk' ? 'Delete Multiple Tickets?' : 'Delete Ticket?'}
                message={deleteModal.type === 'bulk'
                    ? `Are you sure you want to delete these ${deleteModal.count} tickets? This action cannot be undone.`
                    : 'Are you sure you want to delete this ticket? This action cannot be undone.'}
                isDeleting={isDeleting}
            />
        </div >
    );
};

export default Complaints;
