import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCog, FaSave, FaPalette, FaGlobe, FaPhone, FaDice } from 'react-icons/fa'
import { siteContentAPI } from '@api/siteContentAPI'
import type { SiteSetting } from '../../types/siteContent'

const SiteSettingsManagement = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await siteContentAPI.admin.getSiteSettings()
      setSettings(response.data.data)

      // Convert to map for easier editing
      const map: Record<string, string> = {}
      response.data.data.forEach((setting) => {
        map[setting.setting_key] = setting.setting_value || ''
      })
      setSettingsMap(map)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('ไม่สามารถโหลดการตั้งค่าได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Convert map back to array
      const settingsArray = Object.entries(settingsMap).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }))

      await siteContentAPI.admin.updateSiteSettings({ settings: settingsArray })
      toast.success('บันทึกการตั้งค่าสำเร็จ')
      loadSettings()
    } catch (error: any) {
      console.error('Save failed:', error)
      toast.error(error.response?.data?.error || 'ไม่สามารถบันทึกได้')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettingsMap({ ...settingsMap, [key]: value })
  }

  // Group settings by group_name
  const groupedSettings = settings.reduce((acc, setting) => {
    const group = setting.group_name || 'other'
    if (!acc[group]) acc[group] = []
    acc[group].push(setting)
    return acc
  }, {} as Record<string, SiteSetting[]>)

  const getGroupIcon = (groupName: string) => {
    switch (groupName) {
      case 'theme': return <FaPalette className="text-purple-500" />
      case 'general': return <FaGlobe className="text-blue-500" />
      case 'contact': case 'social': return <FaPhone className="text-green-500" />
      case 'lottery': return <FaDice className="text-yellow-500" />
      default: return <FaCog className="text-gray-500" />
    }
  }

  const getGroupTitle = (groupName: string) => {
    const titles: Record<string, string> = {
      general: 'ทั่วไป',
      theme: 'ธีม',
      seo: 'SEO',
      contact: 'ติดต่อ',
      social: 'โซเชียลมีเดีย',
      lottery: 'หวย',
    }
    return titles[groupName] || groupName
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaCog className="text-primary-500" />
            ตั้งค่าเว็บไซต์
          </h1>
          <p className="text-gray-400 mt-1">
            การตั้งค่าทั้งหมด {settings.length} รายการ
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaSave />
          {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
        </button>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {Object.entries(groupedSettings).map(([groupName, groupSettings]) => (
          <div key={groupName} className="card p-6">
            {/* Group Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
              {getGroupIcon(groupName)}
              <h2 className="text-xl font-bold">{getGroupTitle(groupName)}</h2>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupSettings.map((setting) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium mb-2">
                    {setting.description || setting.setting_key}
                    {setting.is_system && (
                      <span className="ml-2 text-xs text-yellow-500">(System)</span>
                    )}
                  </label>

                  {setting.setting_type === 'boolean' ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsMap[setting.setting_key] === 'true'}
                        onChange={(e) =>
                          updateSetting(setting.setting_key, e.target.checked ? 'true' : 'false')
                        }
                        className="checkbox"
                      />
                      <span className="text-sm">
                        {settingsMap[setting.setting_key] === 'true' ? 'เปิด' : 'ปิด'}
                      </span>
                    </label>
                  ) : setting.setting_type === 'number' ? (
                    <input
                      type="number"
                      value={settingsMap[setting.setting_key] || ''}
                      onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                      className="input w-full"
                    />
                  ) : setting.setting_type === 'json' ? (
                    <textarea
                      value={settingsMap[setting.setting_key] || ''}
                      onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                      className="input w-full h-24 resize-none font-mono text-sm"
                      rows={4}
                    />
                  ) : setting.setting_key.includes('color') ? (
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settingsMap[setting.setting_key] || '#6366f1'}
                        onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                        className="h-10 w-20 cursor-pointer rounded border border-gray-600"
                      />
                      <input
                        type="text"
                        value={settingsMap[setting.setting_key] || ''}
                        onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                        className="input flex-1"
                        placeholder="#6366f1"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={settingsMap[setting.setting_key] || ''}
                      onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                      className="input w-full"
                      placeholder={setting.setting_value || ''}
                    />
                  )}

                  {setting.setting_key && (
                    <p className="text-xs text-gray-500 mt-1">
                      Key: <code className="bg-gray-800 px-1 rounded">{setting.setting_key}</code>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button (Bottom) */}
      <div className="card p-4 mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaSave />
          {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
        </button>
      </div>

      {/* Preview Section */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">ตัวอย่าง</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Preview */}
          {settingsMap.primary_color && settingsMap.secondary_color && (
            <div>
              <p className="text-sm font-medium mb-2">สีธีม</p>
              <div className="flex gap-2">
                <div
                  className="w-20 h-20 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: settingsMap.primary_color }}
                >
                  Primary
                </div>
                <div
                  className="w-20 h-20 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: settingsMap.secondary_color }}
                >
                  Secondary
                </div>
              </div>
            </div>
          )}

          {/* Text Preview */}
          <div>
            <p className="text-sm font-medium mb-2">ข้อความ</p>
            <div className="space-y-1 text-sm">
              <div><strong>ชื่อเว็บ:</strong> {settingsMap.site_name}</div>
              <div className="text-gray-400">{settingsMap.site_description}</div>
              {settingsMap.line_contact && (
                <div><strong>LINE:</strong> {settingsMap.line_contact}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SiteSettingsManagement
