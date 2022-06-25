import { ReactElement, ReactNode } from "react";
import { numberFormat } from "../../utils/currency";

const style = {
  padding: 6,
  backgroundColor: "#fff",
  border: "1px solid #ccc"
};

const CustomTooltip = (props: {
  active?: boolean,
  payload: any[];
  children: ReactElement | ((currData: any) => ReactNode)
}) => {
  const { active, payload, children } = props;
  if (active) {
    const currData = payload && payload.length ? payload[0].payload : null;

    return (
      <div className="area-chart-tooltip" style={style}>
        {typeof children == 'function' && children(currData)}
      </div>
    );
  }

  return null;
};


export default CustomTooltip
