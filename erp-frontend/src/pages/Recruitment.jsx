import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Plus, Search, FileText, Download, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Recruitment = () => {
    const [applications, setApplications] = useState([]);
    const [formData, setFormData] = useState({
        candidateName: '',
        position: '',
        email: '',
        resumeLink: '',
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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

    const fetchApplications = async () => {
        try {
            const response = await api.get('/jobs');
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter(app =>
        (statusFilter === 'All' || app.status === statusFilter) &&
        (app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.position.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing application
                await api.put(`/jobs/${editingId}`, formData);
                setEditingId(null);
            } else {
                // Create new application
                await api.post('/jobs', { ...formData, status: 'Applied' });
            }
            setFormData({ candidateName: '', position: '', email: '', resumeLink: '' });
            fetchApplications();
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to save application.');
        }
    };

    const handleEdit = (app) => {
        setFormData({
            candidateName: app.candidateName,
            position: app.position,
            email: app.email,
            resumeLink: app.resumeLink || '',
        });
        setEditingId(app._id);
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
                await api.delete(`/jobs/${deleteModal.id}`);
                setSelectedIds(selectedIds.filter(id => id !== deleteModal.id));
            } else {
                await api.post('/jobs/bulk-delete', { ids: selectedIds });
                setSelectedIds([]);
            }
            fetchApplications();
            setDeleteModal({ isOpen: false, type: null, id: null, count: 0 });
        } catch (error) {
            console.error('Error deleting candidates:', error);
            alert('Failed to delete.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentItems.map(app => app._id);
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
        setFormData({ candidateName: '', position: '', email: '', resumeLink: '' });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Recruitment Report', 14, 10);

        const tableColumn = ["Candidate Name", "Position", "Email", "Status", "Resume Link"];
        const tableRows = filteredApplications.map(app => [
            app.candidateName,
            app.position,
            app.email,
            app.status,
            app.resumeLink || 'N/A'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('recruitment_applications.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Recruitment</h2>
                    <p className="text-gray-500 text-sm">Manage job applications and candidates.</p>
                </div>
                {/* Removed Add Candidate button from here as it is handled by the form */}
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-purple-400 ring-1 ring-purple-400' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Candidate' : 'Add Candidate'}</h3>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="candidateName" placeholder="Candidate Name" value={formData.candidateName} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    <input type="text" name="position" placeholder="Position Applying For" value={formData.position} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    <input type="text" name="resumeLink" placeholder="Resume Link (Optional)" value={formData.resumeLink} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />

                    <button type="submit" className={`col-span-1 md:col-span-2 py-3 rounded-xl font-semibold transition-colors text-white mt-2 ${editingId ? 'bg-purple-500 hover:bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                        {editingId ? 'Update Application' : 'Submit Application'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full xl:w-auto">
                        <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">Candidates</h3>
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

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 w-full md:w-64">
                            <Search size={18} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent outline-none text-sm text-gray-600 w-full"
                            />
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
                                        checked={currentItems.length > 0 && currentItems.every(app => selectedIds.includes(app._id))}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                </th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Candidate</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Position</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Email</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Status</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Resume</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="py-6 text-center">Loading...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="7" className="py-6 text-center">No applications found.</td></tr>
                            ) : (
                                currentItems.map((app) => (
                                    <tr key={app._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(app._id)}
                                                onChange={() => handleSelectOne(app._id)}
                                                className="rounded text-purple-600 focus:ring-purple-500"
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-800">{app.candidateName}</td>
                                        <td className="py-4 px-6">{app.position}</td>
                                        <td className="py-4 px-6 text-gray-500">{app.email}</td>
                                        <td className="py-4 px-6">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {app.resumeLink ? (
                                                <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                    <FileText size={14} /> View
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs">N/A</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleEdit(app)} className="text-blue-500 hover:text-blue-700 inline-block"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(app._id)} className="text-red-500 hover:text-red-700 inline-block"><Trash2 size={18} /></button>
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
                        <p className="text-center text-gray-500">No applications found.</p>
                    ) : (
                        currentItems.map((app) => (
                            <div key={app._id} className="bg-white border boundary-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(app._id)}
                                    onChange={() => handleSelectOne(app._id)}
                                    className="absolute top-4 right-4 rounded text-purple-600 focus:ring-purple-500"
                                />
                                <div className="flex justify-between items-start pr-8">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{app.candidateName}</h4>
                                        <p className="text-xs text-gray-500">{app.position}</p>
                                    </div>
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">
                                        {app.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50 mt-1">
                                    <span className="text-gray-500 truncate max-w-[150px]">{app.email}</span>
                                    {app.resumeLink && (
                                        <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                                            <FileText size={12} /> Resume
                                        </a>
                                    )}
                                </div>
                                <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={() => handleEdit(app)} className="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(app._id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredApplications.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-6 border-t border-gray-100">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-purple-600'}`}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:text-purple-600'}`}
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
                title={deleteModal.type === 'bulk' ? 'Delete Multiple Candidates?' : 'Delete Candidate?'}
                message={deleteModal.type === 'bulk'
                    ? `Are you sure you want to delete these ${deleteModal.count} candidates? This action cannot be undone.`
                    : 'Are you sure you want to delete this candidate? This action cannot be undone.'}
                isDeleting={isDeleting}
            />
        </div >
    );
};

export default Recruitment;
