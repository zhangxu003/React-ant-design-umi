// import { delay } from 'roadhog-api-doc';

// 响应数据 interface
function IResp(data) {
  this.data = data;
  this.responseCode = '200';
}

// 检查信息
function getExerciseTaskOverview(req, res) {
  const data = {
    taskId: '1',
    timeStamp: '1561437918000', // 报告生成时间戳
    taskName: 'MOCK-练习实时报告', // 任务名称
    classNum: '2', // 班级数量
    paperList: [
      {
        paperId: 'p1',
        snapshotId: 'ss1',
        paperName: '试卷名称-1',
        mark: '50', // 总分
      },
      // {
      //   "paperId": "p2",
      //   "snapshotId": "ss2",
      //   "paperName": "试卷名称-2",
      //   "mark": "60" // 总分
      // }
    ],
    classList: [
      {
        classId: 'c1',
        className: '一年级(1)班',
      },
      {
        classId: 'c2',
        className: '一年级(2)班',
      },
    ],
    examNum: 28, // 实练人数
    studentNum: 30, // 应练人数
  };
  res.send(new IResp(data));
}

// 整卷试做报告
function getExerciseTranscript(req, res) {
  const data = {
    taskId: '1', // 任务ID
    timeStamp: '1561437918000', // 报告生成时间戳
    transcriptStatics: [
      {
        snapshotId: 'ss1',
        transcript: [
          {
            className: '一年级(1)班',
            studentId: 'st-1',
            examNo: '0001',
            studentName: '学生1-1',
            score: 46,
            subjectScore: 23,
            objectScore: 23,
            elapsedime: 9000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-5',
            examNo: '0005',
            studentName: '学生1-2',
            score: 32,
            subjectScore: 23,
            objectScore: 9,
            elapsedime: 90000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-6',
            examNo: '0006',
            studentName: '学生1-3',
            score: 50,
            subjectScore: 27,
            objectScore: 23,
            elapsedime: 90000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-7',
            examNo: '0007',
            studentName: '学生1-4',
            score: 18,
            subjectScore: 0,
            objectScore: 18,
            elapsedime: 25000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-8',
            examNo: '0008',
            studentName: '学生1-5',
            score: 48,
            subjectScore: 40,
            objectScore: 8,
            elapsedime: 28000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-9',
            examNo: '0009',
            studentName: '学生1-6',
            score: 0,
            subjectScore: 0,
            objectScore: 0,
            elapsedime: 32000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-10',
            examNo: '0010',
            studentName: '学生1-7',
            score: 62,
            subjectScore: 48,
            objectScore: 14,
            elapsedime: 12000,
          },
          {
            className: '一年级(2)班',
            studentId: 'st-2',
            examNo: '0002',
            studentName: '学生2-2',
            score: 35,
            subjectScore: 18,
            objectScore: 1,
            elapsedime: 1850,
          },
          {
            className: '一年级(2)班',
            studentId: 'st-3',
            examNo: '0003',
            studentName: '学生2-3',
            score: 35,
            subjectScore: 18,
            objectScore: 1,
            elapsedime: 1850,
          },
          {
            className: '一年级(2)班',
            studentId: 'st-4',
            examNo: '0004',
            studentName: '学生2-4',
            score: 40,
            subjectScore: 22,
            objectScore: 18,
            elapsedime: 2850,
          },
          {
            className: '一年级(2)班',
            studentId: 'st-11',
            examNo: '0011',
            studentName: '学生2-5',
            score: 55,
            subjectScore: 32.5,
            objectScore: 22.5,
            elapsedime: 10000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-1100',
            examNo: '0100',
            studentName: '学生2-5',
            score: null,
            subjectScore: null,
            objectScore: null,
            elapsedime: null,
          },
        ],
      },
      {
        snapshotId: 'ss2',
        transcript: [
          {
            className: '一年级(1)班',
            studentId: 'st-1',
            examNo: '0001',
            studentName: '学生s1-1',
            score: 46,
            subjectScore: 23,
            objectScore: 23,
            elapsedime: 9000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-5',
            examNo: '0005',
            studentName: '学生s1-2',
            score: 32,
            subjectScore: 23,
            objectScore: 9,
            elapsedime: 90000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-6',
            examNo: '0006',
            studentName: '学生s1-3',
            score: 50,
            subjectScore: 27,
            objectScore: 23,
            elapsedime: 90000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-7',
            examNo: '0007',
            studentName: '学生s1-4',
            score: 18,
            subjectScore: 0,
            objectScore: 18,
            elapsedime: 25000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-8',
            examNo: '0008',
            studentName: '学生s1-5',
            score: 48,
            subjectScore: 40,
            objectScore: 8,
            elapsedime: 28000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-9',
            examNo: '0009',
            studentName: '学生s1-6',
            score: 0,
            subjectScore: 0,
            objectScore: 0,
            elapsedime: 32000,
          },
          {
            className: '一年级(1)班',
            studentId: 'st-10',
            examNo: '0010',
            studentName: '学生s1-7',
            score: 62,
            subjectScore: 48,
            objectScore: 14,
            elapsedime: 12000,
          },
          {
            className: '一年级(2)班',
            studentId: 'st-2',
            examNo: '0002',
            studentName: '学生s2-2',
            score: 35,
            subjectScore: 18,
            objectScore: 1,
            elapsedime: 1850,
          },
          {
            className: '一年级(2)班',
            studentId: 'st-3',
            examNo: '0003',
            studentName: '学生s2-3',
            score: 35,
            subjectScore: 18,
            objectScore: 1,
            elapsedime: 1850,
          },
          {
            className: '一年级(2)班',
            studentId: 'st-4',
            examNo: '0004',
            studentName: '学生s2-4',
            score: 40,
            subjectScore: 22,
            objectScore: 18,
            elapsedime: 2850,
          },
          {
            className: '一年级(2)班',
            studentId: 'st-11',
            examNo: '0011',
            studentName: '学生s2-5',
            score: 55,
            subjectScore: 32.5,
            objectScore: 22.5,
            elapsedime: 10000,
          },
        ],
      },
    ],
  };
  res.send(new IResp(data));
}

function getExerciseTimeStamp(req, res) {
  const { taskId } = req.params;
  const data = {
    taskId,
    timeStamp: '1561438918000', // 报告生成时间戳
  };
  res.send(new IResp(data));
}

const apiMap = {
  'POST /proxy/exercise/summarize-data': getExerciseTaskOverview,
  'POST /proxy/exercise/transcript': getExerciseTranscript,
  'POST /proxy/exercise/result': getExerciseTimeStamp,
};
export default apiMap;
// export default delay(apiMap, 1000);
