import React, { useState, useEffect } from 'react';
import { iotService } from '../services/iot.service';
import { farmService } from '../services/farm.service';
import { Cpu, Plus, Search, MoreVertical, RefreshCw, Radio, Zap, Activity, Loader2, Play, StopCircle, Trash2 } from 'lucide-react';

export const AdminIoT: React.FC = () => {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [seedingDeviceEui, setSeedingDeviceEui] = useState<string>('');
    const [seedingAll, setSeedingAll] = useState(false);
    const [simulationBusy, setSimulationBusy] = useState(false);

    // Simulation State
    const [isSimulating, setIsSimulating] = useState(false);

    // Registration State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [farms, setFarms] = useState<any[]>([]);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [newDevice, setNewDevice] = useState({
        device_name: '',
        device_eui: '',
        device_type: 'lorawan_sensor',
        farm_id: '',
        hardware_version: '1.0.0',
        firmware_version: '1.0.0'
    });

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = await iotService.getDevices();
            setDevices(data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSimulationStatus = async () => {
        try {
            const result = await iotService.getRealtimeSimulationStatus();
            setIsSimulating(Boolean(result?.data?.active));
        } catch (err) {
            console.error(err);
            setIsSimulating(false);
        }
    };

    const fetchFarms = async () => {
        try {
            const data = await farmService.getAllFarms();
            setFarms(data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterLoading(true);
        try {
            await iotService.registerDevice(newDevice);
            setIsModalOpen(false);
            setNewDevice({
                device_name: '',
                device_eui: '',
                device_type: 'lorawan_sensor',
                farm_id: '',
                hardware_version: '1.0.0',
                firmware_version: '1.0.0'
            });
            fetchDevices();
        } catch (err) {
            console.error(err);
            alert('Lỗi khi đăng ký thiết bị. Vui lòng kiểm tra lại EUI (phải là duy nhất).');
        } finally {
            setRegisterLoading(false);
        }
    };

    const openModal = () => {
        fetchFarms();
        setIsModalOpen(true);
    };

    const handleSimulate = async (device: any) => {
        if (!confirm(`Gửi dữ liệu giả lập cho ${device.device_name} (${device.device_eui})?`)) return;
        try {
            await iotService.simulateReading(device.device_eui);
            alert('Dữ liệu đã được gửi thành công!');
        } catch (err) {
            console.error(err);
            alert('Lỗi khi gửi dữ liệu');
        }
    };

    const handleDeleteDevice = async (device: any) => {
        if (!confirm(`Xóa thiết bị ${device.device_name} (${device.device_eui})?`)) return;
        try {
            await iotService.deleteDevice(device.id);
            await fetchDevices();
            alert('Đã xóa thiết bị.');
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa thiết bị.';
            alert(msg);
        }
    };

    const handleSeedHistory = async (device?: any) => {
        const deviceEui = device?.device_eui;
        const target = deviceEui ? `${device.device_name} (${deviceEui})` : 'toàn bộ thiết bị đã gán farm';
        if (!confirm(`Tạo dữ liệu giả lập 7 ngày cho ${target}?`)) return;
        try {
            if (deviceEui) setSeedingDeviceEui(deviceEui);
            else setSeedingAll(true);
            const result = await iotService.seedSimulatedHistory(deviceEui, 7, 60);
            alert(result?.message || 'Đã seed dữ liệu giả lập 7 ngày.');
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || err?.message || 'Seed dữ liệu thất bại.';
            alert(msg);
        } finally {
            setSeedingDeviceEui('');
            setSeedingAll(false);
        }
    };

    const toggleSimulation = async () => {
        if (devices.length === 0) {
            alert('Không có thiết bị nào để giả lập!');
            return;
        }

        setSimulationBusy(true);
        try {
            if (isSimulating) {
                await iotService.stopRealtimeSimulation();
                setIsSimulating(false);
                alert('Đã dừng giả lập thời gian thực trên server.');
            } else {
                if (!confirm('Bắt đầu chế độ giả lập dữ liệu thời gian thực cho toàn bộ thiết bị đã gán farm?')) return;
                await iotService.startRealtimeSimulation(2000);
                setIsSimulating(true);
                alert('Đã bật giả lập thời gian thực trên server. Dashboard sẽ tiếp tục nhận dữ liệu kể cả khi rời trang này.');
            }
        } catch (err) {
            console.error(err);
            alert('Không thể thay đổi trạng thái giả lập thời gian thực.');
        } finally {
            setSimulationBusy(false);
        }
    };

    useEffect(() => {
        fetchDevices();
        fetchSimulationStatus();
    }, []);

    return (
        <div className="admin-iot-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex justify-between items-center admin-page-toolbar" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Quản lý thiết bị IoT</h1>
                    <p className="text-secondary">Cấu hình EUI, quản lý trạng thái kết nối và giám sát phần cứng.</p>
                </div>
                <div className="admin-page-actions" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="secondary" onClick={fetchDevices}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="secondary" onClick={() => handleSeedHistory()} disabled={seedingAll}>
                        {seedingAll ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
                        Seed 7 ngày
                    </button>
                    <button
                        className={`secondary ${isSimulating ? 'status-danger' : ''}`}
                        onClick={toggleSimulation}
                        disabled={simulationBusy}
                        style={{ marginRight: '1rem', borderColor: isSimulating ? 'var(--danger)' : 'var(--primary-green)', color: isSimulating ? 'var(--danger)' : 'var(--primary-green)' }}
                    >
                        {simulationBusy ? <Loader2 size={18} className="animate-spin" /> : isSimulating ? <StopCircle size={18} /> : <Play size={18} />}
                        {isSimulating ? 'Dừng Giả Lập' : 'Chạy Giả Lập'}
                    </button>
                    <button className="primary" onClick={openModal}>
                        <Plus size={18} /> Đăng ký thiết bị
                    </button>
                </div>
            </div>

            <div className="grid admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '2rem' }}>
                <div className="card glass-card flex items-center gap-4">
                    <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--primary-green)' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Thiết bị trực tuyến</p>
                        <h3 style={{ margin: 0 }}>{devices.filter(d => d.status === 'active').length} / {devices.length}</h3>
                    </div>
                </div>
                <div className="card glass-card flex items-center gap-4">
                    <div style={{ padding: '12px', background: 'rgba(20, 184, 166, 0.1)', borderRadius: '12px', color: 'var(--accent-teal)' }}>
                        <Radio size={24} />
                    </div>
                    <div>
                        <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Tổng số trạm kết nối</p>
                        <h3 style={{ margin: 0 }}>{new Set(devices.map(d => d.farm_id).filter(Boolean)).size} Trạm</h3>
                    </div>
                </div>
                <div className="card glass-card flex items-center gap-4">
                    <div style={{ padding: '12px', background: 'rgba(132, 204, 22, 0.1)', borderRadius: '12px', color: 'var(--accent-lime)' }}>
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Dữ liệu nhận (24h)</p>
                        <h3 style={{ margin: 0 }}>{isSimulating ? 'Đang phát dữ liệu realtime' : 'Chưa bật giả lập realtime'}</h3>
                    </div>
                </div>
            </div>

            <div className="card glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="admin-table-toolbar" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '0.85rem', color: 'var(--text-muted)' }} />
                        <input
                            placeholder="Tìm kiếm DevEUI, tên thiết bị..."
                            style={{ marginBottom: 0, paddingLeft: '3rem' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border-light)' }}>
                                <th style={{ padding: '1.2rem' }}>Thiết bị</th>
                                <th style={{ padding: '1.2rem' }}>ID hệ thống</th>
                                <th style={{ padding: '1.2rem' }}>Loại phần cứng</th>
                                <th style={{ padding: '1.2rem' }}>Trạng thái</th>
                                <th style={{ padding: '1.2rem' }}>Pin / Tín hiệu</th>
                                <th style={{ padding: '1.2rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Chưa có thiết bị nào được đăng ký.
                                    </td>
                                </tr>
                            ) : (
                                devices.map((device) => (
                                    <tr key={device.id} style={{ borderBottom: '1px solid var(--border-light)' }} className="table-row-hover">
                                        <td style={{ padding: '1.2rem' }}>
                                            <div className="admin-entity-cell">
                                                <div className="admin-entity-icon" style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--accent-teal) 100%)', color: 'white' }}>
                                                    <Cpu size={20} />
                                                </div>
                                                <div className="admin-entity-copy">
                                                    <h4>{device.device_name}</h4>
                                                    <p>Trạm: {device.farms?.farm_name || 'Chưa gán'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem', fontSize: '0.85rem' }}>{device.device_eui}</td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--bg-green-subtle)', color: 'var(--primary-dark)', borderRadius: '6px' }}>
                                                {device.device_type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div className="flex items-center gap-2">
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: device.status === 'active' ? 'var(--success)' : 'var(--danger)' }}></div>
                                                <span style={{ fontSize: '0.85rem' }}>{device.status === 'active' ? 'Trực tuyến' : 'Ngoại tuyến'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <p>Pin: {device.battery_level}%</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FW: {device.firmware_version}</p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem', display: 'flex', gap: '8px' }}>
                                            <button
                                                className="secondary"
                                                style={{ padding: '8px', borderRadius: '50%' }}
                                                onClick={() => handleSimulate(device)}
                                                title="Gửi dữ liệu giả lập"
                                            >
                                                <Play size={16} color="var(--primary-green)" />
                                            </button>
                                            <button
                                                className="secondary"
                                                style={{ padding: '8px', borderRadius: '50%' }}
                                                onClick={() => handleSeedHistory(device)}
                                                title="Seed dữ liệu giả lập 7 ngày"
                                                disabled={seedingDeviceEui === device.device_eui}
                                            >
                                                {seedingDeviceEui === device.device_eui ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Activity size={16} color="#3b82f6" />
                                                )}
                                            </button>
                                            <button className="secondary" style={{ padding: '8px', borderRadius: '50%' }}>
                                                <MoreVertical size={16} />
                                            </button>
                                            <button
                                                className="secondary"
                                                style={{ padding: '8px', borderRadius: '50%', color: '#ef4444' }}
                                                onClick={() => handleDeleteDevice(device)}
                                                title="Xóa thiết bị"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Đăng Ký Thiết Bị */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
                }} onClick={() => setIsModalOpen(false)}>
                    <div style={{
                        background: 'white', width: '100%', maxWidth: '500px',
                        borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-xl)',
                        animation: 'fadeIn 0.3s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ padding: '10px', background: 'var(--bg-green-subtle)', borderRadius: '12px', color: 'var(--primary-green)' }}>
                                <Plus size={24} />
                            </div>
                            <h2 style={{ margin: 0 }}>Đăng Ký Thiết Bị Mới</h2>
                        </div>

                        <form onSubmit={handleRegister}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tên thiết bị</label>
                                <input
                                    required
                                    value={newDevice.device_name}
                                    onChange={e => setNewDevice({ ...newDevice, device_name: e.target.value })}
                                    placeholder="Ví dụ: Cảm biến độ mặn Farm A"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>DevEUI (16 ký tự)</label>
                                <input
                                    required
                                    value={newDevice.device_eui}
                                    onChange={e => setNewDevice({ ...newDevice, device_eui: e.target.value })}
                                    placeholder="Ví dụ: A84041000181C921"
                                    maxLength={16}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontFamily: 'monospace' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Gán vào Trạm / Farm</label>
                                <select
                                    value={newDevice.farm_id}
                                    onChange={e => setNewDevice({ ...newDevice, farm_id: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                                >
                                    <option value="">-- Chưa gán --</option>
                                    {farms.map(f => (
                                        <option key={f.id} value={f.id}>{f.farm_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phiên bản phần cứng</label>
                                    <input
                                        value={newDevice.hardware_version}
                                        onChange={e => setNewDevice({ ...newDevice, hardware_version: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phiên bản firmware</label>
                                    <input
                                        value={newDevice.firmware_version}
                                        onChange={e => setNewDevice({ ...newDevice, firmware_version: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3" style={{ marginTop: '2rem' }}>
                                <button type="button" className="secondary" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className="primary" disabled={registerLoading}>
                                    {registerLoading ? <Loader2 className="animate-spin" size={18} /> : 'Đăng ký ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};



