import React, { useState, useEffect } from 'react';
import { BookOpen, Users, ArrowLeftRight, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [transactionChart, setTransactionChart] = useState(null);
  const [categoryChart, setCategoryChart] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, transactionsRes, categoriesRes, activitiesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts/transactions'),
        api.get('/dashboard/charts/categories'),
        api.get('/dashboard/activities')
      ]);

      setStats(statsRes.data);
      
      // Prepare transaction chart data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const transactionData = {
        labels: transactionsRes.data.map(item => `${months[item._id.month - 1]} ${item._id.year}`),
        datasets: [
          {
            label: 'Books Issued',
            data: transactionsRes.data.map(item => item.issued),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
          {
            label: 'Books Returned',
            data: transactionsRes.data.map(item => item.returned),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
          }
        ]
      };
      setTransactionChart(transactionData);

      // Prepare category chart data
      const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ];
      
      const categoryData = {
        labels: categoriesRes.data.map(item => item._id),
        datasets: [{
          data: categoriesRes.data.map(item => item.count),
          backgroundColor: colors.slice(0, categoriesRes.data.length),
          borderColor: colors.slice(0, categoriesRes.data.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        }]
      };
      setCategoryChart(categoryData);

      setActivities(activitiesRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks || 0,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-100'
    },
    {
      title: 'Available Books',
      value: stats.availableBooks || 0,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-100'
    },
    {
      title: 'Issued Books',
      value: stats.issuedBooks || 0,
      icon: ArrowLeftRight,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-100'
    },
    {
      title: 'Total Members',
      value: stats.totalMembers || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-100'
    },
    {
      title: 'Active Members',
      value: stats.activeMembers || 0,
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-100'
    },
    {
      title: 'Overdue Books',
      value: stats.overdueBooks || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Library Dashboard</h1>
        <p className="text-gray-300">Overview of your library management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`glass-card p-6 bg-gradient-to-r ${card.color} hover:scale-105 transition-transform duration-200 cursor-pointer group`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textColor} opacity-80`}>
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full group-hover:bg-opacity-30 transition-colors">
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Monthly Transactions
          </h3>
          {transactionChart && (
            <div className="chart-container">
              <Bar
                data={transactionChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: 'white'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    y: {
                      ticks: {
                        color: 'white'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Category Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Books by Category
          </h3>
          {categoryChart && (
            <div className="chart-container">
              <Doughnut
                data={categoryChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'white',
                        padding: 20
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {activity.user?.name || 'System'}
                    </p>
                    <p className="text-gray-300 text-xs">
                      {activity.details}
                    </p>
                  </div>
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(activity.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No recent activities
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;