# Google Cloud Setup

DEPLOY_PROJECT_ID=<DEPLOY_PROJECT_ID>
gcloud config set project $DEPLOY_PROJECT_ID
DEPLOY_PROJECT_NUMBER=$(gcloud projects describe $DEPLOY_PROJECT_ID --format 'value(projectNumber)')

gcloud services enable iam.googleapis.com cloudbuild.googleapis.com clouddeploy.googleapis.com servicenetworking.googleapis.com container.googleapis.com run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

gcloud artifacts repositories create task-app --repository-format=docker --location=europe-west2 --description="Docker repo for task app"

gcloud projects add-iam-policy-binding $DEPLOY_PROJECT_ID --member=serviceAccount:$DEPLOY_PROJECT_NUMBER@cloudbuild.gserviceaccount.com --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $DEPLOY_PROJECT_ID --member=serviceAccount:$DEPLOY_PROJECT_NUMBER@cloudbuild.gserviceaccount.com --role="roles/run.admin"

gcloud projects add-iam-policy-binding $DEPLOY_PROJECT_ID --member=serviceAccount:$DEPLOY_PROJECT_NUMBER@cloudbuild.gserviceaccount.com --role="roles/owner"

gcloud beta builds triggers import --project=$DEPLOY_PROJECT_ID --source=build/triggers/task-app-trigger.yaml

echo <YOUR SENDGRID API KEY> > ./config/sendgrid-api-key.txt
echo <YOUR MONGO BASE URL> > ./config/mongo-base-url.txt
echo <YOUR_JWT_SECRET> > ./config/jwt-secret.txt

gcloud secrets create sendgrid-api-key --replication-policy="automatic"
gcloud secrets versions add sendgrid-api-key --data-file="./config/sendgrid-api-key.txt"

gcloud secrets create mongo-base-url --replication-policy="automatic"
gcloud secrets versions add mongo-base-url --data-file="./config/mongo-base-url.txt"

gcloud secrets create jwt-secret --replication-policy="automatic"
gcloud secrets versions add jwt-secret --data-file="./config/jwt-secret.txt"




<!-- 

BELOW IS FOR CLOUD DEPLOY

gcloud projects add-iam-policy-binding $DEPLOY_PROJECT_ID --member=serviceAccount:$DEPLOY_PROJECT_NUMBER-compute@developer.gserviceaccount.com --role="roles/clouddeploy.jobRunner"

gcloud iam service-accounts add-iam-policy-binding $DEPLOY_PROJECT_NUMBER-compute@developer.gserviceaccount.com --member=serviceAccount:$DEPLOY_PROJECT_NUMBER-compute@developer.gserviceaccount.com --role="roles/iam.serviceAccountUser" --project=$DEPLOY_PROJECT_ID

gcloud projects add-iam-policy-binding $DEPLOY_PROJECT_ID --member=serviceAccount:$DEPLOY_PROJECT_NUMBER-compute@developer.gserviceaccount.com --role="roles/run.developer"

gcloud deploy apply --file=deploy/clouddeploy.yaml --region=europe-west2 --project=$DEPLOY_PROJECT_ID

gcloud deploy releases create test-release --skaffold-file=deploy/skaffold.yaml --project=$DEPLOY_PROJECT_ID --region=europe-west2 --delivery-pipeline=task-app --images=my-app-image=europe-west2-docker.pkg.dev/$_DEPLOY_PROJECT_ID/task-app/task-app-server -->