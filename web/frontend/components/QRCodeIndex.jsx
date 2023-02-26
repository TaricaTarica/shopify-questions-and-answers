import { useNavigate } from "@shopify/app-bridge-react";
import {
  LegacyCard,
  ResourceList,
  ResourceItem, 
  Text, 
  Badge, 
  Columns,
  Thumbnail
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
          const {id, question, questionedBy, questionedOn, answer, answeredBy, answeredOn, productId, product, createdAt} = item;
          const media = <Thumbnail source={product.images[0].src} alt={product.images[0].alt} /> ;

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
              xs: '4fr .5fr',
              md: '9fr .5fr',
            }}
            gap={{
              xs: '0',
              md: '1',
            }}>
              <Text variant="bodyMd" fontWeight="bold" as="h2">
                {truncate(product.title, 25)}
              </Text>
              <Badge status={answer ? 'success' : 'attention'}>
                {answer ? 'Answered' : 'Unanswered'}
              </Badge>
              <Text variant="bodyMd" fontWeight="normal">
                <i>{truncate(question, 25)}</i>
              </Text>
              <div></div>
              <div>
                <small>Asked by <span>{questionedBy}</span> on {dateFormatter(questionedOn)}</small>
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

function dateFormatter(str) { 
  return (new Date(str)).toDateString();
}
