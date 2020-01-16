/**
 * 根据任务的不同，显示不同的文案
 */
import { formatMessage } from 'umi/locale';

const TT_1 = ()=>({
  type            : "exam",
  name            : formatMessage({id:"task.text.testExam",defaultMessage:"考试"}),
  ctualAttend     : formatMessage({id:"task.text.actual.exam",defaultMessage:"实考"}),
  shouldAttend    : formatMessage({id:"task.text.should.exam",defaultMessage:"应考"}),
  unTask          : formatMessage({id:"task.text.NoReference",defaultMessage:"不参考"}),
});

const TT_2 = ()=>({
  type            : "pracitce",
  name            : formatMessage({id:"task.text.Practicing",defaultMessage:"练习"}),
  ctualAttend     : formatMessage({id:"task.text.actual.practice",defaultMessage:"实练"}),
  shouldAttend    : formatMessage({id:"task.text.should.practice",defaultMessage:"应练"}),
  unTask          : formatMessage({id:"task.text.NotPracticing",defaultMessage:"不参练"}),
});

const TT_3 = ()=>({
  type            : "exam",
  name            : formatMessage({id:"task.text.testExam",defaultMessage:"考试"}),
  ctualAttend     : formatMessage({id:"task.text.actual.exam",defaultMessage:"实考"}),
  shouldAttend    : formatMessage({id:"task.text.should.exam",defaultMessage:"应考"}),
  unTask          : formatMessage({id:"task.text.NoReference",defaultMessage:"不参考"}),
});

const TT_6 = ()=>({
  type            : "exam",
  name            : formatMessage({id:"task.text.testExam",defaultMessage:"考试"}),
  ctualAttend     : formatMessage({id:"task.text.actual.exam",defaultMessage:"实考"}),
  shouldAttend    : formatMessage({id:"task.text.should.exam",defaultMessage:"应考"}),
  unTask          : formatMessage({id:"task.text.NoReference",defaultMessage:"不参考"}),
});

export default (tag="TT_`")=>({TT_1:TT_1(),TT_2:TT_2(),TT_3:TT_3(),TT_6:TT_6()}[tag]);
