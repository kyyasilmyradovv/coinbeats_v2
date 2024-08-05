// src/pages/SessionAnalysisPage.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import { Page, Navbar, Block, BlockTitle } from 'konsta/react';
import 'chart.js/auto'; // Ensure chart.js is available globally

const SessionAnalysisPage: React.FC = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('http://localhost:7000/api/sessions');
        console.log('Fetched sessions:', response.data); // Debugging line
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  const processSessionData = () => {
    const userDurations = sessions.reduce((acc, session) => {
      if (session.telegramUserId) {
        acc[session.telegramUserId] = (acc[session.telegramUserId] || 0) + session.duration;
      }
      return acc;
    }, {});

    const routes = sessions.reduce((acc, session) => {
      const routeDurations = JSON.parse(session.routeDurations);
      Object.keys(routeDurations).forEach(route => {
        acc[route] = (acc[route] || 0) + routeDurations[route];
      });
      return acc;
    }, {});

    const dailySessions = sessions.reduce((acc, session) => {
      const date = new Date(session.sessionStart).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const averageSessionDuration = sessions.reduce((acc, session) => {
      const date = new Date(session.sessionStart).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + session.duration;
      return acc;
    }, {});

    return { userDurations, routes, dailySessions, averageSessionDuration };
  };

  const { userDurations, routes, dailySessions, averageSessionDuration } = processSessionData();

  return (
    <Page>
      <Navbar title="Session Analysis" />

      <BlockTitle>User Session Durations</BlockTitle>
      <Block>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">User ID</th>
              <th className="py-2">Total Session Duration (seconds)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(userDurations).map(([userId, duration]) => (
              <tr key={userId}>
                <td className="py-2">{userId}</td>
                <td className="py-2">{duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>

      <BlockTitle>Route Visits</BlockTitle>
      <Block>
        <Bar
          data={{
            labels: Object.keys(routes),
            datasets: [{
              label: 'Route Visits',
              data: Object.values(routes),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          }}
          options={{
            scales: {
              y: { beginAtZero: true }
            }
          }}
        />
      </Block>

      <BlockTitle>Daily Visitors</BlockTitle>
      <Block>
        <Line
          data={{
            labels: Object.keys(dailySessions),
            datasets: [{
              label: 'Visitors Per Day',
              data: Object.values(dailySessions),
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1
            }]
          }}
          options={{
            scales: {
              y: { beginAtZero: true }
            }
          }}
        />
      </Block>

      <BlockTitle>Average Session Duration Per Day</BlockTitle>
      <Block>
        <Line
          data={{
            labels: Object.keys(averageSessionDuration),
            datasets: [{
              label: 'Average Session Duration',
              data: Object.keys(averageSessionDuration).map(date => averageSessionDuration[date] / dailySessions[date]),
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            }]
          }}
          options={{
            scales: {
              y: { beginAtZero: true }
            }
          }}
        />
      </Block>
    </Page>
  );
};

export default SessionAnalysisPage;
