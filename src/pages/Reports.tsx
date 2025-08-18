import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Package, DollarSign, Calendar, ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

interface StocktakeReport {
  id: string;
  shelfName: string;
  date: string;
  itemsCounted: number;
  totalItems: number;
  valueChange: number;
  status: "completed" | "in-progress" | "pending";
}

// Empty reports for new users
const mockReports: StocktakeReport[] = [];

const Reports = () => {
  const completedReports = mockReports.filter(r => r.status === "completed");
  const totalValueChange = completedReports.reduce((sum, r) => sum + r.valueChange, 0);
  const totalItemsCounted = mockReports.reduce((sum, r) => sum + r.itemsCounted, 0);
  const totalItems = mockReports.reduce((sum, r) => sum + r.totalItems, 0);
  const overallProgress = totalItems > 0 ? (totalItemsCounted / totalItems) * 100 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="shadow-md">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Stocktake Reports
              </h1>
              <p className="text-muted-foreground">View counting progress and valuation changes</p>
            </div>
          </div>
          
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>

        {mockReports.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-4">
                Start counting inventory to generate reports
              </p>
              <Link to="/counting">
                <Button>Start Counting</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
              <Progress value={overallProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {totalItemsCounted} of {totalItems} items counted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Value Change</CardTitle>
              {totalValueChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalValueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalValueChange >= 0 ? '+' : ''}${totalValueChange.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">From completed counts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Shelves</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedReports.length}</div>
              <p className="text-xs text-muted-foreground">Out of {mockReports.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,456</div>
              <p className="text-xs text-muted-foreground">Estimated total</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest stocktake activities and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">Left Shelf counting completed</p>
                    <p className="text-sm text-muted-foreground">15 items counted, +$125.50 value increase</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">2 hours ago</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="font-semibold">Center Rack variance detected</p>
                    <p className="text-sm text-muted-foreground">5 items missing, -$45.00 value decrease</p>
                  </div>
                </div>
                <Badge variant="secondary">5 hours ago</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold">Big Deep counting completed</p>
                    <p className="text-sm text-muted-foreground">12 items counted, +$89.99 value increase</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">1 day ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Stocktake Reports by Shelf</CardTitle>
            <CardDescription>Detailed breakdown of counting progress and value changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Package className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{report.shelfName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.itemsCounted} of {report.totalItems} items counted
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(report.status)}
                        <span className="text-xs text-muted-foreground">{report.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={report.totalItems > 0 ? (report.itemsCounted / report.totalItems) * 100 : 0} 
                          className="w-20" 
                        />
                        <span className="text-sm font-medium">
                          {report.totalItems > 0 ? Math.round((report.itemsCounted / report.totalItems) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Value Change</p>
                      <p className={`font-semibold ${
                        report.valueChange > 0 ? 'text-green-600' : 
                        report.valueChange < 0 ? 'text-red-600' : 
                        'text-muted-foreground'
                      }`}>
                        {report.valueChange > 0 ? '+' : ''}${report.valueChange.toFixed(2)}
                      </p>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
           </CardContent>
         </Card>
          </>
        )}
       </div>
     </div>
   );
 };
 
 export default Reports;