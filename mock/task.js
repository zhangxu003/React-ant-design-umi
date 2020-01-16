export default {
  // 支持值为 Object 和 Array
  'POST /practice/filter-teacher-exam': {
    data: {
      total: 100,
      size: 10,
      current: 1,
      records: [
        {
          taskId: '46263191910482013',
          name: '1年级(33)班模考2019414',
          type: 'TT_1',
          typeValue: '本班考试',
          status: 'TS_2',
          statusValue: '进行中',
          linkStatus: 'ES_5',
          linkStatusValue: '',
          examTime: 1557821955479,
          distributeType: 'DT_1',
          distributeValue: '按IP地址',
          examStatus: 'ET_1,ET_2,ET_3',
          examStatusValue: '',
          rectifyType: 'CURRENT_TEACHER',
          rectifyValue: '',
          examNum: 0,
          studentNum: 0,
          classList: [{ classId: '45793955995975699', className: '1年级(33)班' }],
          paperList: [
            {
              paperId: '40975570699289600',
              name: '朱正国的试卷',
              fullMark: 0.0,
              paperTime: 0,
              grade: null,
              gradeValue: null,
              templateName: null,
              paperTemplateId: '40605223185547264',
              isExamination: null,
            },
          ],
          teacher: {teacherName:"test",path:"http://wiki.aidoin.com/download/attachments/2130129/user-avatar"},

          monitorTeacher: [
            {teacherId:1,teacherName:"tesdgsdfgst",path:"http://wiki.aidoin.com/download/attachments/2130129/user-avatar"},
            {teacherId:2,teacherName:"teasdfasdfst",path:"http://wiki.aidoin.com/download/attachments/2130129/user-avatar"},
            {teacherId:3,teacherName:"fssdfgsdfgf",path:"http://wiki.aidoin.com/images/logo/default-space-logo.svg"}
          ],
        },
      ],
      pages: 10,
    },
    responseCode: '200',
  },
  'POST /practice/batch/task-link-status': {"data":{"taskId":"46263191910482013","status":"TS_2","linkStatus":"ES_5"},"responseCode":"200"},

  'POST /practice/batches-student-count': {
    "data":{
        "noExamStudentCount":"10",
        "batchInfo":[
            {
                "taskId":"222",
                "batchNo":"222",
                "teacherId":"222",
                "teacherName":"22",
                "status":"2222",
                "startTime":"222",
                "path":"2222"
            }
        ],
        "studentExamInfo":[
            {
              "taskId":"任务ID1",
              "classId":"班级ID1",
              "studentId":"学生ID1",
              "studentName":"学生姓名1",
              "examStatus":"ES_3",
              "monitoringDesc":"",
              "snapshotInfo":[
                  {
                      "snapshotId":"试卷快照ID",
                      "respondentsStatus":"答卷包状态"
                  }
              ]
            },
            {
              "taskId":"任务ID2",
              "classId":"班级ID2",
              "studentId":"学生ID2",
              "studentName":"学生姓名2",
              "examStatus":"ES_3",
              "monitoringDesc":"",
              "snapshotInfo":[
                  {
                      "snapshotId":"试卷快照ID2",
                      "respondentsStatus":"答卷包状态2"
                  }
              ]
            },
            {
              "taskId":"任务ID3",
              "classId":"班级ID3",
              "studentId":"学生ID3",
              "studentName":"学生姓名3",
              "examStatus":"ES_3",
              "monitoringDesc":"",
              "snapshotInfo":[
                  {
                      "snapshotId":"试卷快照ID",
                      "respondentsStatus":"答卷包状态"
                  }
              ]
            },
            {
              "taskId":"任务ID3",
              "classId":"班级ID3",
              "studentId":"学生ID4",
              "studentName":"学生姓名3",
              "examStatus":"ES_3",
              "monitoringDesc":"",
              "snapshotInfo":[
                  {
                      "snapshotId":"试卷快照ID",
                      "respondentsStatus":"答卷包状态"
                  }
              ]
            },
            {
              "taskId":"任务ID3",
              "classId":"班级ID3",
              "studentId":"学生ID5",
              "studentName":"学生姓名3",
              "examStatus":"ES_3",
              "monitoringDesc":"",
              "snapshotInfo":[
                  {
                      "snapshotId":"试卷快照ID",
                      "respondentsStatus":"答卷包状态"
                  }
              ]
            },
            {
              "taskId":"任务ID3",
              "classId":"班级ID3",
              "studentId":"学生ID6",
              "studentName":"学生姓名3",
              "examStatus":"ES_3",
              "monitoringDesc":"",
              "snapshotInfo":[
                  {
                      "snapshotId":"试卷快照ID",
                      "respondentsStatus":"答卷包状态"
                  }
              ]
            },
            {
              "taskId":"任务ID3",
              "classId":"班级ID3",
              "studentId":"学生ID7",
              "studentName":"学生姓名3",
              "examStatus":"ES_3",
              "monitoringDesc":"",
              "snapshotInfo":[
                  {
                      "snapshotId":"试卷快照ID",
                      "respondentsStatus":"答卷包状态"
                  }
              ]
            },
            {
              "taskId":"任务ID3",
              "classId":"班级ID3",
              "studentId":"学生ID8",
              "studentName":"学生姓名3",
              "examStatus":"ES_3",
              "monitoringDesc":"",
              "snapshotInfo":[
                  {
                      "snapshotId":"试卷快照ID",
                      "respondentsStatus":"答卷包状态"
                  }
              ]
            }
          ]
      },
      "responseCode":"200"
    },


  'POST /proxy-taskInfo/to-server/task': {
    "data": "ok",
    "responseCode":"200"
  },

};
