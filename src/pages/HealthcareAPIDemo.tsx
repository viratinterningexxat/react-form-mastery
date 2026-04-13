import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  useNPIVerification, 
  useDrugValidation, 
  useLabTestLookup,
  useCredentialVerification,
  useVaccineSchedule,
  useHealthCardVerification
} from '@/hooks/useHealthcareAPIs';
import { 
  Shield, 
  Pill, 
  FlaskConical, 
  Stethoscope, 
  QrCode,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';

export function HealthcareAPIDemo() {
  // NPI Verification
  const [npiInput, setNpiInput] = useState('');
  const { provider, loading: npiLoading, error: npiError, verifyNPI } = useNPIVerification();

  // Drug Validation
  const [drugInput, setDrugInput] = useState('');
  const { drugs, loading: drugLoading, error: drugError, searchDrugs } = useDrugValidation();

  // Lab Test Lookup
  const [labInput, setLabInput] = useState('');
  const { tests, loading: labLoading, error: labError, searchLabTests } = useLabTestLookup();

  // Comprehensive Verification
  const { 
    verificationResult, 
    loading: verifyLoading, 
    error: verifyError, 
    verifyCredential 
  } = useCredentialVerification();

  // Vaccine Schedule
  const { schedule, loading: scheduleLoading, error: scheduleError } = useVaccineSchedule();

  // Health Card Verification
  const [qrInput, setQrInput] = useState('');
  const { 
    healthCard, 
    immunizations, 
    loading: healthCardLoading, 
    error: healthCardError, 
    verifyHealthCard 
  } = useHealthCardVerification();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Free Healthcare APIs Integration
          </h1>
          <p className="text-lg text-gray-600">
            Demonstration of free healthcare APIs for credential verification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NPI Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                NPI Provider Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter NPI number (10 digits)"
                    value={npiInput}
                    onChange={(e) => setNpiInput(e.target.value)}
                    maxLength={10}
                  />
                  <Button 
                    onClick={() => verifyNPI(npiInput)}
                    disabled={npiLoading || npiInput.length !== 10}
                  >
                    {npiLoading ? 'Verifying...' : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                
                {npiError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {npiError}
                  </div>
                )}
                
                {provider && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Provider Verified</span>
                    </div>
                    <p className="text-sm text-green-700">
                      <strong>{provider.firstName} {provider.lastName}</strong>
                    </p>
                    <p className="text-sm text-green-700">
                      NPI: {provider.npi}
                    </p>
                    <p className="text-sm text-green-700">
                      Specialty: {provider.primaryTaxonomy?.desc}
                    </p>
                    <p className="text-sm text-green-700">
                      License: {provider.primaryTaxonomy?.license} ({provider.primaryTaxonomy?.state})
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Drug/Vaccine Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Drug/Vaccine Validation (RxNorm)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter drug or vaccine name"
                    value={drugInput}
                    onChange={(e) => setDrugInput(e.target.value)}
                  />
                  <Button 
                    onClick={() => searchDrugs(drugInput)}
                    disabled={drugLoading || !drugInput.trim()}
                  >
                    {drugLoading ? 'Searching...' : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                
                {drugError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {drugError}
                  </div>
                )}
                
                {drugs.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {drugs.slice(0, 5).map((drug, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900">{drug.name}</p>
                        <p className="text-sm text-blue-700">RxCUI: {drug.rxcui}</p>
                        <Badge variant="secondary" className="text-xs">
                          {drug.tty}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lab Test Lookup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                Lab Test Codes (LOINC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search lab tests (e.g., TB, Hepatitis B)"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                  />
                  <Button 
                    onClick={() => searchLabTests(labInput)}
                    disabled={labLoading || !labInput.trim()}
                  >
                    {labLoading ? 'Searching...' : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                
                {labError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {labError}
                  </div>
                )}
                
                {tests.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tests.slice(0, 5).map((test, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-900">{test.longCommonName}</p>
                        <p className="text-sm text-purple-700">LOINC: {test.loincNum}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {test.component}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {test.system}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SMART Health Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                SMART Health Card Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste QR code data (shc://...)"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                  />
                  <Button 
                    onClick={() => verifyHealthCard(qrInput)}
                    disabled={healthCardLoading || !qrInput.startsWith('shc://')}
                  >
                    {healthCardLoading ? 'Verifying...' : <Shield className="w-4 h-4" />}
                  </Button>
                </div>
                
                {healthCardError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {healthCardError}
                  </div>
                )}
                
                {healthCard && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Health Card Valid</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Issuer: {healthCard.iss}
                    </p>
                    <p className="text-sm text-green-700">
                      Immunizations: {immunizations.length} records found
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vaccine Schedule */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              CDC Immunization Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduleLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading vaccine schedule...</p>
              </div>
            ) : scheduleError ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 inline mr-2" />
                {scheduleError}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedule.slice(0, 6).map((item: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{item.vaccine_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Age: {item.minimum_age} - {item.maximum_age} years
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Doses: {item.dose_number}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Free API Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">NPI Registry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">RxNorm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">LOINC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">CDC Open Data</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              All APIs are free to use with no enterprise contracts required. 
              Perfect for development, testing, and small-scale production use.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}