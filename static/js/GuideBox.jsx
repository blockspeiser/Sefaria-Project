import React from 'react';
import PropTypes from 'prop-types';
import Component from 'react-class';
import Sefaria from "./sefaria/sefaria";
import TextRange from "./TextRange";
import {AiInfoTooltip} from './Misc';

// Constants for different prompt states
const QUESTIONS = "questions";
const SUMMARIES = "summaries";
const COMMENTARIES = "commentaries";

/**
 * Renders the question prompts in a box.
 * @param {Array} props.prompt - The array of question prompts.
 * @param {Function} props.onClick - The function to handle click events on prompts.
 * @returns {JSX.Element} The QuestionBox component.
 */
const QuestionBox = ({ prompt, onClick }) => {

  const questionHelperText = (p) => {
    return `${p.commentaries.length} ${p.commentaries.length > 0 ? 'Answers' : 'Answer'}`;
  }

  return (
    <div>
      <div className="guideTitle">
        Key Questions
      </div>
      {prompt.map((p, i) => {
        return (
          <div key={i} className="guidePromptBox" onClick={() => onClick(p, i)}>
            <p>{p.question}</p>
            <span>{questionHelperText(p)}</span>
          </div>
        )
      })}
    </div>
  );
}

/**
 * Renders the summary prompts in a box.
 * @param {Object} props.prompt - The summary prompt object.
 * @param {Function} props.onClick - The function to handle click events on prompts.
 * @returns {JSX.Element} The SummaryBox component.
 */
const SummaryBox = ({ prompt, onClick }) => {
  const title = (commentaryRef) => {
    const index = Sefaria.parseRef(commentaryRef)?.index;
    return index ? index.replace(/ on Pesach Haggadah$/, "") : commentaryRef;
  }

  return (
    <div>
      <div className="guideTitle">
        {prompt.question}
      </div>
      {prompt.commentaries.map((p, i) => {
        return (
          <div key={i} className="guidePromptBox" onClick={() => onClick(p.commentaryRef, i)}>
            <p>{p.summaryText}</p>
            <span>{title(p.commentaryRef)}</span>
          </div>
        )
      })}
    </div>
  );
}


class GuideBox extends Component {
  constructor(props) {
    super(props);
    const guides = Sefaria.guidesByRef(props.sref);
    const guide = guides[0];
    this.state = {
      guideLanguage: Sefaria.interfaceLang,
      guide: guide,
      livePrompt: guide.questions,
      promptState: QUESTIONS,
      commentaryRef: ""
    };
    this.stateHistory = [];
  }

  componentDidUpdate(prevProps) {
    if (this.props.sref !== prevProps.sref) {
      const guides = Sefaria.guidesByRef(this.props.sref);
      if (guides.length) {
        const guide = guides[0];
        this.setState({ guide: guide, livePrompt: guide.questions, promptState: QUESTIONS });
        this.resetHistory();
      }
    }
  }

  /**
   * Overrides the setState method to add the current state to the history before updating it.
   * @param {Object} newState - The new state object.
   */
  setState(newState) {
    this.stateHistory.push(this.state);
    super.setState(newState);
    this.props.setPreviousSettings({onClick: this.popState, url: "", backText: newState.backText});
  }

  /**
   * Resets the state history.
   */
  resetHistory() {
    this.stateHistory = [];
    this.props.setPreviousSettings(null);
  }

  /**
   * Removes the last state from the history and sets it as the current state.
   */
  popState() {
    const lastState = this.stateHistory.pop();
    super.setState(lastState);
    if (this.stateHistory.length === 0) {
      this.props.setPreviousSettings(null);
    }
    else {
      this.props.setPreviousSettings({onClick: this.popState, url: "", backText: lastState.backText});
    }
  }

  onClickQuestion = (p, i) => {
    const parsedRef = Sefaria.parseRef(this.props.sref);
    gtag("event", "guide_question_clicked", {
      panel_type: "sidebar",
      panel_number: 1.5,  // Theoretically, this could be 2.5, 3.5, etc.
      panel_name: "Learning Guide",
      panel_category: "Resources | Guide",
      ref: this.props.sref,
      position: i + 1,
      experiment: true,
      text: p.question,
      feature_name: "Key Questions",
      engagement_type: "consult",
      engagement_value: 1,
      item_id: parsedRef.index
      // version
      // A_alef
      // content_type
    });
    this.setState({ promptState: SUMMARIES, livePrompt: p, backText: "Questions" });
  }


  onClickSummary = (commentaryRef, i) => {
    const parsedRef = Sefaria.parseRef(this.props.sref);
    gtag("event", "guide_answer_clicked", {
      panel_type: "sidebar",
      panel_number: 1.5,  // Theoretically, this could be 2.5, 3.5, etc.
      panel_name: "Learning Guide",
      panel_category: "Resources | Guide",
      ref: this.props.sref,
      position: i + 1,  // Ideally, this should be question pos and answer pos.
      experiment: true,
      // text
      feature_name: "Key Questions",
      engagement_type: "consult",
      engagement_value: 1,
      item_id: parsedRef.index
      // version
      // A_alef
      // content_type
    });
    this.setState({ promptState: COMMENTARIES, commentaryRef: commentaryRef, backText: "Summary" });
  }

  render() {
    return (
      <section className="guideBox">
        <h2 className="guideHeader">
          <span className="int-en">Learning Guide</span>
          <span className="int-he">מדריך למידה</span>
          <AiInfoTooltip/>
        </h2>
        {this.state.promptState === QUESTIONS && <QuestionBox prompt={this.state.livePrompt} onClick={this.onClickQuestion} />}
        {this.state.promptState === SUMMARIES && <SummaryBox prompt={this.state.livePrompt} onClick={this.onClickSummary} />}
        {this.state.promptState === COMMENTARIES && <TextRange sref={this.state.commentaryRef} />}
      </section>
    )
  }
}

GuideBox.propTypes = {
  masterPanelLanguage: PropTypes.oneOf(["english", "hebrew", "bilingual"]),
  sref: PropTypes.string.isRequired,
};

export default GuideBox;
