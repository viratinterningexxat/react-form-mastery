import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCredentials } from '@/hooks/useCredentials';
import { CredentialDocument } from '@/types/credential';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface StudentCredential extends CredentialDocument {
  studentId?: string;
  studentName?: string;
}

interface StudentData {
  id: string;
  name: string;
  program: string;
  school: string;
  credentials: StudentCredential[];
  totalRequired: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  expiringCount: number;
}

export default function Students() {
  const { documents, requirements } = useCredentials();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');

  // Group documents by student
  const studentsData = useMemo(() => {
    const studentMap = new Map<string, StudentData>();

    (documents as StudentCredential[]).forEach((doc) => {
      const studentId = doc.studentId || 'unknown';
      const studentName = doc.studentName || 'Unknown Student';

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: studentName,
          program: 'Nursing', // Mock data
          school: 'University of California',
          credentials: [],
          totalRequired: requirements.length,
          approvedCount: 0,
          pendingCount: 0,
          rejectedCount: 0,
          expiringCount: 0,
        });
      }

      const student = studentMap.get(studentId)!;
      student.credentials.push(doc);

      // Count by status
      if (doc.status === 'approved' || doc.status === 'approved_with_exception') {
        student.approvedCount++;
      } else if (doc.status === 'pending_review') {
        student.pendingCount++;
      } else if (doc.status === 'rejected') {
        student.rejectedCount++;
      }

      // Check for expiring credentials
      if (doc.expiresAt) {
        const daysUntil = Math.floor((new Date(doc.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 30 && daysUntil > 0) {
          student.expiringCount++;
        }
      }
    });

    return Array.from(studentMap.values());
  }, [documents, requirements]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return studentsData.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'complete' && student.approvedCount === student.totalRequired) ||
                           (statusFilter === 'pending' && student.pendingCount > 0) ||
                           (statusFilter === 'expiring' && student.expiringCount > 0);

      const matchesProgram = programFilter === 'all' || student.program === programFilter;

      return matchesSearch && matchesStatus && matchesProgram;
    });
  }, [studentsData, searchTerm, statusFilter, programFilter]);

  const getReadinessStatus = (student: StudentData) => {
    if (student.approvedCount === student.totalRequired) {
      return { status: 'Complete', color: 'bg-green-500', icon: CheckCircle };
    } else if (student.pendingCount > 0) {
      return { status: 'Pending Review', color: 'bg-yellow-500', icon: Clock };
    } else if (student.expiringCount > 0) {
      return { status: 'Expiring Soon', color: 'bg-orange-500', icon: AlertTriangle };
    } else {
      return { status: 'Incomplete', color: 'bg-red-500', icon: XCircle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Students</h1>
          <p className="text-muted-foreground">Manage and monitor student credentialing progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="w-4 h-4 mr-2" />
            {filteredStudents.length} Students
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="nursing">Nursing</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => {
          const readiness = getReadinessStatus(student);
          const StatusIcon = readiness.icon;

          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {student.id} • {student.program} • {student.school}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${readiness.color} text-white`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {readiness.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{student.approvedCount}</div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{student.pendingCount}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{student.rejectedCount}</div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{student.expiringCount}</div>
                    <div className="text-sm text-muted-foreground">Expiring</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{student.approvedCount}/{student.totalRequired} credentials</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(student.approvedCount / student.totalRequired) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No students found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}