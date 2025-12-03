import React, { useEffect, useState } from "react";
import { Table, Spin, message, Select, Card, Row, Col, Typography, Divider } from "antd";
import axios from "axios";
import { TrophyOutlined, CalendarOutlined, FileOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Title } = Typography;

const Leaderboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("all-time");
  const [examId, setExamId] = useState("");
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // Fetch available exams for the filter
  useEffect(() => {
    const fetchExams = async () => {
      setLoadingExams(true);
      try {
        const response = await axios.get("/api/exams/get-all-exams");
        if (response.data.success) {
          setExams(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  // Fetch leaderboard data with filters
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Build query parameters
        let queryParams = new URLSearchParams();
        queryParams.append("limit", 20); // Show top 20 users
        
        if (period !== "all-time") {
          queryParams.append("period", period);
        }
        
        if (examId) {
          queryParams.append("examId", examId);
        }
        
        const response = await axios.get(`/api/users/leaderboard?${queryParams.toString()}`);
        
        if (response.data.success) {
          setData(response.data.data);
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        message.error("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period, examId]);

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: "15%",
      render: (_, __, index) => {
        // Custom styling for top 3 ranks
        if (index === 0) {
          return (
            <div className="rank-badge gold">
              <TrophyOutlined /> 1
            </div>
          );
        } else if (index === 1) {
          return (
            <div className="rank-badge silver">
              <TrophyOutlined /> 2
            </div>
          );
        } else if (index === 2) {
          return (
            <div className="rank-badge bronze">
              <TrophyOutlined /> 3
            </div>
          );
        }
        return index + 1;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "50%",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      width: "35%",
    },
  ];

  const handlePeriodChange = (value) => {
    setPeriod(value);
  };

  const handleExamChange = (value) => {
    setExamId(value);
  };

  return (
    <div>
      <Card>
        <Title level={2}>
          <TrophyOutlined /> Leaderboard
        </Title>
        <Divider />
        
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 10 }}>
              <CalendarOutlined /> Time Period:
            </div>
            <Select
              value={period}
              onChange={handlePeriodChange}
              style={{ width: "100%" }}
            >
              <Option value="all-time">All Time</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="yearly">Yearly</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 10 }}>
              <FileOutlined /> Exam:
            </div>
            <Select
              value={examId}
              onChange={handleExamChange}
              style={{ width: "100%" }}
              placeholder="All Exams"
              loading={loadingExams}
              allowClear
            >
              {exams.map((exam) => (
                <Option key={exam._id} value={exam._id}>
                  {exam.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={data}
            columns={columns}
            rowKey="_id"
            pagination={false}
            locale={{ emptyText: "No leaderboard data available" }}
          />
        )}
      </Card>
      
      <style jsx="true">{`
        .rank-badge {
          display: inline-block;
          padding: 0 10px;
          border-radius: 12px;
          font-weight: bold;
        }
        .gold {
          background-color: #ffd700;
          color: #5c4f00;
        }
        .silver {
          background-color: #c0c0c0;
          color: #3e3e3e;
        }
        .bronze {
          background-color: #cd7f32;
          color: #3e2a10;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;