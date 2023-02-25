import { useNavigate } from "@shopify/app-bridge-react";
import {
  LegacyCard,
  ResourceList,
  ResourceItem, 
  Text, 
  Badge, 
  Columns,
  Icon
} from "@shopify/polaris";
import { QuestionMarkMajor } from "@shopify/polaris-icons";

export function QRCodeIndex({ questions, loading }) {
  const navigate = useNavigate();

  const resourceName = {
    singular: "Question",
    plural: "Questions",
  };

  return (
    <LegacyCard 
      selectable={false}
      loading={loading}
      >
          <ResourceList
        resourceName={resourceName}
        items={questions}
        renderItem={(item) => {
          const {id, question, questionedBy, questionedOn, answer, answeredBy, answeredOn, productId, createdAt} = item;
          const media = <Icon source={QuestionMarkMajor} color="highlight"  />;

          return (
            <ResourceItem
            id={id}
            accessibilityLabel={`View details for ${question}`}
            media={media}
            onClick={() => {
              navigate(`/questions/${id}`);
            }}
          >
            <Columns columns={{
              xs: '3fr .5fr',
              md: '7fr .5fr',
            }}
            gap={{
              xs: '0',
              md: '1',
            }}>
              <Text variant="bodyMd" fontWeight="bold" as="h3">
              {truncate(question, 25)}
              </Text>
              <Badge progress="incomplete" status="attention">
                Unanswered
              </Badge>
              <div>
                <p>{questionedBy}</p>
                <p>{questionedOn}</p>
              </div>
            </Columns>
            </ResourceItem>
          );
        }}
      />
    </LegacyCard>
  ); 
}

/* A function to truncate long strings */
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}
