import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingCart, Plus, Search, MapPin, Download, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        shippingAddress: '',
        totalAmount: '',
        itemName: '',
        quantity: 1,
        itemPrice: 0,
        status: 'Pending'
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [editingId, setEditingId] = useState(null);

    const [selectedIds, setSelectedIds] = useState([]);

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: null,
        id: null,
        count: 0
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        (statusFilter === 'All' || order.status === statusFilter) &&
        (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const payload = {
                    customerName: formData.customerName,
                    email: formData.email,
                    shippingAddress: formData.shippingAddress,
                    totalAmount: formData.totalAmount,
                    status: formData.status
                };
                await api.put(`/orders/${editingId}`, payload);
                setEditingId(null);
            } else {
                const payload = {
                    customerName: formData.customerName,
                    email: formData.email,
                    shippingAddress: formData.shippingAddress,
                    totalAmount: formData.totalAmount,
                    items: [{
                        itemName: formData.itemName || 'Standard Item',
                        quantity: Number(formData.quantity) || 1,
                        price: Number(formData.itemPrice) || 0,
                    }],
                    status: 'Pending'
                };
                await api.post('/orders', payload);
            }

            setFormData({
                customerName: '', email: '', shippingAddress: '', totalAmount: '',
                itemName: '', quantity: 1, itemPrice: 0, status: 'Pending'
            });
            fetchOrders();
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Failed to save order.');
        }
    };

    const handleEdit = (order) => {
        setFormData({
            customerName: order.customerName,
            email: order.email || '',
            shippingAddress: order.shippingAddress,
            totalAmount: order.totalAmount,
            itemName: order.items && order.items[0] ? order.items[0].itemName : '',
            quantity: order.items && order.items[0] ? order.items[0].quantity : 1,
            itemPrice: order.items && order.items[0] ? order.items[0].price : 0,
            status: order.status
        });
        setEditingId(order._id);
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
                await api.delete(`/orders/${deleteModal.id}`);
                setSelectedIds(selectedIds.filter(id => id !== deleteModal.id));
            } else {
                await api.post('/orders/bulk-delete', { ids: selectedIds });
                setSelectedIds([]);
            }
            fetchOrders();
            setDeleteModal({ isOpen: false, type: null, id: null, count: 0 });
        } catch (error) {
            console.error('Error deleting orders:', error);
            alert('Failed to delete.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentItems.map(o => o._id);
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
        setFormData({
            customerName: '', email: '', shippingAddress: '', totalAmount: '',
            itemName: '', quantity: 1, itemPrice: 0, status: 'Pending'
        });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Orders Report', 14, 10);

        const tableColumn = ["Order ID", "Customer Name", "Total Amount", "Status", "Address"];
        const tableRows = filteredOrders.map(o => [
            o._id,
            o.customerName,
            `$${o.totalAmount}`,
            o.status,
            o.shippingAddress
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('orders.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Order Processing</h2>
                    <p className="text-gray-500 text-sm">Manage customer orders and shipments.</p>
                </div>
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Order' : 'Create New Order'}</h3>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="customerName" placeholder="Customer Name" value={formData.customerName} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    <input type="text" name="shippingAddress" placeholder="Address" value={formData.shippingAddress} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    <input type="number" name="totalAmount" placeholder="Total Amount ($)" value={formData.totalAmount} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required />

                    {editingId && (
                        <select name="status" value={formData.status} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    )}

                    {!editingId && (
                        <div className="md:col-span-2 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                            <input type="text" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                            <input type="number" name="quantity" placeholder="Qty" value={formData.quantity} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                            <input type="number" name="itemPrice" placeholder="Price" value={formData.itemPrice} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                    )}

                    <button type="submit" className={`col-span-1 md:col-span-2 py-3 rounded-xl font-semibold transition-colors text-white mt-2 ${editingId ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'}`}>
                        {editingId ? 'Update Order' : 'Place Order'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full xl:w-auto">
                        <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">Recent Orders</h3>
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
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 w-full md:w-64">
                            <Search size={18} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent outline-none text-sm text-gray-600 w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="py-4 px-6 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={currentItems.length > 0 && currentItems.every(o => selectedIds.includes(o._id))}
                                        className="rounded text-green-600 focus:ring-green-500"
                                    />
                                </th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Order ID</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Customer</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Amount</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Status</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Address</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="py-6 text-center">Loading...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="7" className="py-6 text-center">No orders found.</td></tr>
                            ) : (
                                currentItems.map((order) => (
                                    <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(order._id)}
                                                onChange={() => handleSelectOne(order._id)}
                                                className="rounded text-green-600 focus:ring-green-500"
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs text-gray-400">#{order._id.slice(-6)}</td>
                                        <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                                                {order.customerName.charAt(0)}
                                            </div>
                                            {order.customerName}
                                        </td>
                                        <td className="py-4 px-6 font-semibold">${order.totalAmount}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500 truncate max-w-xs">{order.shippingAddress}</td>
                                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleEdit(order)} className="text-blue-500 hover:text-blue-700 inline-block"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(order._id)} className="text-red-500 hover:text-red-700 inline-block"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden p-4 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : currentItems.length === 0 ? (
                        <p className="text-center text-gray-500">No orders found.</p>
                    ) : (
                        currentItems.map((order) => (
                            <div key={order._id} className="bg-white border boundary-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 relative">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(order._id)}
                                    onChange={() => handleSelectOne(order._id)}
                                    className="absolute top-4 right-4 rounded text-green-600 focus:ring-green-500"
                                />
                                <div className="flex justify-between items-start pr-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                                            {order.customerName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{order.customerName}</h4>
                                            <p className="text-xs text-gray-400 font-mono">ID: #{order._id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <ShoppingCart size={14} className="text-gray-400" />
                                        <span>${order.totalAmount}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span className="truncate">{order.shippingAddress}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={() => handleEdit(order)} className="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(order._id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredOrders.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-6 border-t border-gray-100">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-green-600'}`}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:text-green-600'}`}
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
                title={deleteModal.type === 'bulk' ? 'Delete Multiple Orders?' : 'Delete Order?'}
                message={deleteModal.type === 'bulk'
                    ? `Are you sure you want to delete these ${deleteModal.count} orders? This action cannot be undone.`
                    : 'Are you sure you want to delete this order? This action cannot be undone.'}
                isDeleting={isDeleting}
            />
        </div >
    );
};

export default Orders;
