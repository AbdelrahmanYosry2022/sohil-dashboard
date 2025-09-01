import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  PencilRuler, 
  Image, 
  Palette, 
  Layers, 
  Upload, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  MoreHorizontal,
  FileImage,
  Brush,
  Eraser,
  Move,
  RotateCw
} from 'lucide-react'

interface DrawingAsset {
  id: string
  name: string
  type: 'character' | 'background' | 'prop' | 'effect'
  status: 'draft' | 'review' | 'approved' | 'revision'
  progress: number
  assignedTo: string
  dueDate: Date
  sceneIds: string[]
  thumbnail?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface DrawingScene {
  id: string
  title: string
  status: 'not_started' | 'in_progress' | 'completed'
  assets: string[]
  complexity: 'simple' | 'medium' | 'complex'
  estimatedHours: number
  actualHours?: number
}

export default function DrawingTab() {
  const [assets, setAssets] = useState<DrawingAsset[]>([
    {
      id: '1',
      name: 'الشخصية الرئيسية - وضعية الوقوف',
      type: 'character',
      status: 'approved',
      progress: 100,
      assignedTo: 'أحمد محمد',
      dueDate: new Date('2024-02-15'),
      sceneIds: ['1', '2', '3'],
      notes: 'تم اعتماد التصميم النهائي',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: '2',
      name: 'خلفية المشهد الأول - الغابة',
      type: 'background',
      status: 'review',
      progress: 85,
      assignedTo: 'فاطمة علي',
      dueDate: new Date('2024-02-20'),
      sceneIds: ['1'],
      notes: 'في انتظار مراجعة الألوان',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-18')
    },
    {
      id: '3',
      name: 'الكتاب السحري - عنصر أساسي',
      type: 'prop',
      status: 'in_progress',
      progress: 60,
      assignedTo: 'محمد حسن',
      dueDate: new Date('2024-02-25'),
      sceneIds: ['2', '4'],
      notes: 'يحتاج إضافة تفاصيل الزخارف',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-19')
    }
  ])

  const [scenes] = useState<DrawingScene[]>([
    {
      id: '1',
      title: 'المشهد الأول: الافتتاحية',
      status: 'completed',
      assets: ['1', '2'],
      complexity: 'medium',
      estimatedHours: 12,
      actualHours: 14
    },
    {
      id: '2',
      title: 'المشهد الثاني: اكتشاف الكتاب',
      status: 'in_progress',
      assets: ['1', '3'],
      complexity: 'complex',
      estimatedHours: 18,
      actualHours: 8
    },
    {
      id: '3',
      title: 'المشهد الثالث: التحول',
      status: 'not_started',
      assets: ['1'],
      complexity: 'complex',
      estimatedHours: 20
    }
  ])

  const [selectedAsset, setSelectedAsset] = useState<DrawingAsset | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const getStatusColor = (status: DrawingAsset['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'review': return 'bg-yellow-500'
      case 'approved': return 'bg-green-500'
      case 'revision': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: DrawingAsset['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'revision': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: DrawingAsset['type']) => {
    switch (type) {
      case 'character': return <User className="h-4 w-4" />
      case 'background': return <Image className="h-4 w-4" />
      case 'prop': return <FileImage className="h-4 w-4" />
      case 'effect': return <Brush className="h-4 w-4" />
      default: return <Image className="h-4 w-4" />
    }
  }

  const totalAssets = assets.length
  const completedAssets = assets.filter(a => a.status === 'approved').length
  const overallProgress = totalAssets > 0 ? (completedAssets / totalAssets) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الرسم</h1>
          <p className="text-muted-foreground">تصميم وإدارة عناصر الرسم والشخصيات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4" />
            رفع تصميم
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            عنصر جديد
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي العناصر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">عنصر رسم</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">العناصر المكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedAssets}</div>
            <p className="text-xs text-muted-foreground">معتمد ومكتمل</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {assets.filter(a => a.status === 'review').length}
            </div>
            <p className="text-xs text-muted-foreground">ينتظر الموافقة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">التقدم العام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assets Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PencilRuler className="h-5 w-5" />
                  عناصر الرسم
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(asset.type)}
                          <div>
                            <h4 className="font-medium text-sm">{asset.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {asset.type === 'character' && 'شخصية'}
                              {asset.type === 'background' && 'خلفية'}
                              {asset.type === 'prop' && 'عنصر'}
                              {asset.type === 'effect' && 'تأثير'}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(asset.status)} text-white text-xs`}
                        >
                          {getStatusIcon(asset.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>التقدم</span>
                          <span>{asset.progress}%</span>
                        </div>
                        <Progress value={asset.progress} />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>المسؤول: {asset.assignedTo}</span>
                        <span>المشاهد: {asset.sceneIds.length}</span>
                      </div>
                      
                      {asset.notes && (
                        <p className="text-xs bg-muted/50 p-2 rounded">{asset.notes}</p>
                      )}
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(asset.type)}
                        <div>
                          <h4 className="font-medium text-sm">{asset.name}</h4>
                          <p className="text-xs text-muted-foreground">{asset.assignedTo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <Progress value={asset.progress} />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {asset.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scenes Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                تقدم المشاهد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenes.map((scene) => (
                <div key={scene.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{scene.title}</h4>
                    <Badge 
                      variant={scene.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {scene.status === 'completed' && 'مكتمل'}
                      {scene.status === 'in_progress' && 'قيد العمل'}
                      {scene.status === 'not_started' && 'لم يبدأ'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">العناصر: </span>
                      <span className="font-medium">{scene.assets.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">التعقيد: </span>
                      <span className="font-medium">
                        {scene.complexity === 'simple' && 'بسيط'}
                        {scene.complexity === 'medium' && 'متوسط'}
                        {scene.complexity === 'complex' && 'معقد'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الساعات: </span>
                      <span className="font-medium">
                        {scene.actualHours || 0}/{scene.estimatedHours}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Drawing Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                أدوات الرسم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Brush className="h-4 w-4" />
                فرشاة الرسم
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eraser className="h-4 w-4" />
                ممحاة
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Move className="h-4 w-4" />
                أداة التحريك
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RotateCw className="h-4 w-4" />
                أداة الدوران
              </Button>
            </CardContent>
          </Card>

          {/* Asset Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">أنواع العناصر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: 'character', count: assets.filter(a => a.type === 'character').length, label: 'الشخصيات' },
                { type: 'background', count: assets.filter(a => a.type === 'background').length, label: 'الخلفيات' },
                { type: 'prop', count: assets.filter(a => a.type === 'prop').length, label: 'العناصر' },
                { type: 'effect', count: assets.filter(a => a.type === 'effect').length, label: 'التأثيرات' }
              ].map((item) => (
                <div key={item.type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4" />
                تصدير جميع العناصر
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="h-4 w-4" />
                استيراد مكتبة
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="h-4 w-4" />
                معاينة المشروع
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
