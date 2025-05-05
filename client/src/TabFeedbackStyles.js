
import styled from 'styled-components';
import { FaSpinner } from 'react-icons/fa';

export const Wrapper = styled.div`
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
`;

export const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
`;

export const SmallButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }

  &:disabled {
    background: #ccc;
    color: #666;
    cursor: not-allowed;
  }

  &:disabled svg {
    transform: none;
  }
`;

export const SpinnerIcon = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  opacity: 0.8;

  @keyframes spin {
    0% { transform: rotate(0deg); opacity: 0.8; }
    100% { transform: rotate(360deg); opacity: 1; }
  }
`;

export const LeftButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RightButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DetailCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 32px;
  margin-top: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
`;

export const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
`;

export const FieldCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
`;

export const SectionTitle = styled.h3`
  margin-bottom: 12px;
  color: #007bff;
  font-size: 18px;
`;

export const CenteredSectionTitle = styled(SectionTitle)`
  text-align: center;
  font-size: 22px;
`;

export const FieldItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

export const FieldName = styled.div`
  font-weight: 600;
  color: #333;
  min-width: 140px;
`;

export const FieldValue = styled.div`
  color: #555;
  font-size: 16px;
`;

export const FieldInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
`;

export const TabSection = styled.div`
  margin-bottom: 24px;
  background: #ffffff;
`;

export const TabsBar = styled.div`
  display: flex;
  background: #f7f7f7;
`;

export const TabButton = styled.button`
  flex: 1;
  background: \${props => props.active ? '#007bff' : '#e6f7ff'};
  color: \${props => props.active ? '#ffffff' : '#007bff'};
  padding: 12px 0;
  text-align: center;
  cursor: pointer;
  font-size: 16px;
  border-radius: 0;

  &:hover {
    background: \${props => props.active ? '#0056b3' : '#d0e7ff'};
  }
  &:disabled {
    background: #999;
    color: #ffffff;
    cursor: not-allowed;
  }
`;

export const QuestionList = styled.div`
  background: #fafafa;
  border-radius: 8px;
`;

export const QuestionItem = styled.div`
  border-left: 4px solid #007bff;
  padding: 12px;
`;

export const QuestionText = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
`;

export const AnswerText = styled.div`
  color: #555;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

export const TopInfoRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 40px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

export const Button = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 16px;

  &:hover { background: #0056b3; }
  &:disabled { background: #999; cursor: not-allowed; }
`;
