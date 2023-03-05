import "./Button.css"

function Button(props) {
  return (
    <button {...props} className="btn">{ props.text }</button>
  );
}

export default Button;
