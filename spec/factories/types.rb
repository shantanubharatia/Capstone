FactoryGirl.define do
  factory :type do
    name { Faker::Commerce.product_name }

    trait :with_roles do
      after(:create) do |type|
        Role.create(:role_name=>Role::ORGANIZER,
                    :mname=>Type.name,
                    :mid=>type.id)
      end
    end
  end
end
