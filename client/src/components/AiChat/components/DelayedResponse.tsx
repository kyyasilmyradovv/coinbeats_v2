/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Card, Grid, Image, Typography } from "antd";
import { useEffect, useState } from "react";
import logo1 from "../../../assets/logo.png";
import { getUSDValue } from "../../../functions";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setIsConfirmModalOpen } from "../../../store/general/generalSlice";
import ConfirmModal from "../../modal/ConfirmModal";
// import Loader from "../../Loader";
// import { UserOutlined } from "@ant-design/icons";
const { useBreakpoint } = Grid;
const DelayedResponse = () => {
  const dispatch = useAppDispatch();
  const settedSmothies = useAppSelector(
    (state) => state.general.settedSmothies
  );
  const screens = useBreakpoint();
  const [showResponse, setShowResponse] = useState(false);
  const [showThinking, setShowThinking] = useState(true);

  useEffect(() => {
    const thinkingTimer = setTimeout(() => {
      setShowThinking(false); // Hide "Thinking..." after 3 seconds
      setShowResponse(true); // Show the response
    }, 3000);

    return () => clearTimeout(thinkingTimer); // Cleanup on unmount
  }, []);

  if (showThinking) {
    return (
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {/* <Avatar size={35} icon={<UserOutlined />} src={logo1} /> */}
        <Typography.Text style={{ fontSize: "14px", fontStyle: "italic" }}>
          Thinking...
        </Typography.Text>
        {/* <Spin style={{ color: "white" }} /> */}
      </div>
    );
  }

  if (showResponse) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Typography.Text
          style={{
            marginTop: "5px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Smoothie
        </Typography.Text>

        <Card
          bordered
          style={{
            marginTop: "10px",
            textAlign: "center",
          }}
        >
          <Image src={logo1} preview={false} width={50} height={50} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            <Typography.Text
              style={{
                fontSize: "14px",
                fontWeight: "200",
                width: screens.lg ? "auto" : "100%",
              }}
            >
              You’re creating a Smoothie with 4 tokens worth of $
              {Object.values(settedSmothies ?? {})
                .map((e) => (e.value ?? 0) * (getUSDValue(e.type) ?? 1))
                .reduce(
                  (accumulator, currentValue) => accumulator + currentValue,
                  0
                )}
            </Typography.Text>
            <Button
              onClick={() => dispatch(setIsConfirmModalOpen(true))}
              style={{
                borderRadius: "16px",
                background:
                  "linear-gradient(0deg, #f00 -52.7%, #f5af19 191.82%)",
                marginTop: "10px",
                color: "#FFFFFF",
              }}
            >
              Confirm the transaction
            </Button>
            <ConfirmModal />
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default DelayedResponse;
